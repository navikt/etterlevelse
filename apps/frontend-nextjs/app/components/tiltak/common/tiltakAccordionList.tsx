'use client'

import { mapTiltakToFormValue, updateTiltak } from '@/api/tiltak/tiltakApi'
import TiltakView from '@/components/tiltak/common/tiltakView'
import TiltakForm from '@/components/tiltak/form/tiltakForm'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { PencilIcon } from '@navikt/aksel-icons'
import { Accordion, Button, Modal, Tag } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'

type TProps = {
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
}

type TContentProps = {
  tiltak: ITiltak
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakAccordionList: FunctionComponent<TProps> = ({
  tiltakList,
  setTiltakList,
  risikoscenarioList,
}) => {
  return (
    <Accordion>
      {tiltakList.map((tiltak) => {
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header>
              {tiltak.navn}{' '}
              <div className='flex gap-2'>
                {!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name && (
                  <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>
                )}
                {!tiltak.frist && <Tag variant='alt2'>Tiltaksfrist savnes</Tag>}
              </div>
            </Accordion.Header>
            <Accordion.Content>
              <TiltakAccordionContent
                tiltak={tiltak}
                risikoscenarioList={risikoscenarioList}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
              />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export const TiltakAccordionContent: FunctionComponent<TContentProps> = ({
  tiltak,
  risikoscenarioList,
  tiltakList,
  setTiltakList,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const submit = async (submitedValues: ITiltak) => {
    await updateTiltak(submitedValues)
      .then((response) => {
        setTiltakList(
          tiltakList.map((tiltak) => {
            if (tiltak.id === response.id) {
              return { ...response }
            } else {
              return tiltak
            }
          })
        )
      })
      .finally(() => {
        setIsEditModalOpen(false)
        window.location.reload()
      })
  }
  return (
    <div>
      <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
      <Button
        type='button'
        variant='tertiary'
        size='small'
        icon={<PencilIcon title='' aria-hidden />}
        onClick={() => setIsEditModalOpen(true)}
      >
        Redigér tiltak
      </Button>
      {isEditModalOpen && (
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          header={{ heading: 'Redigér tiltak' }}
        >
          <Modal.Body>
            <TiltakForm
              initialValues={mapTiltakToFormValue(tiltak)}
              pvkDokumentId={tiltak.pvkDokumentId}
              submit={submit}
              close={() => setIsEditModalOpen(false)}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}

export default TiltakAccordionList
