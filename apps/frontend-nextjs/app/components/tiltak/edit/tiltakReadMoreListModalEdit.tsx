'use client'

import { mapTiltakToFormValue, updateTiltak } from '@/api/tiltak/tiltakApi'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Modal, ReadMore } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import TiltakView from '../common/tiltakView'
import TiltakForm from '../form/tiltakForm'

type TProps = {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  allRisikoscenarioList: IRisikoscenario[]
}

type TContentProps = {
  tiltak: ITiltak
  allRisikoscenarioList: IRisikoscenario[]
  setTiltakList: (state: ITiltak[]) => void
  tiltakList: ITiltak[]
}

export const TiltakReadMoreListModalEdit: FunctionComponent<TProps> = ({
  risikoscenario,
  tiltakList,
  allRisikoscenarioList,
  setTiltakList,
}) => {
  return (
    <div>
      {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}
      {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
        <div className='mt-5'>
          {tiltakList
            .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
            .map((tiltak: ITiltak, index: number) => (
              <TiltakReadMoreContent
                key={`${risikoscenario.id}_${tiltak.id}_${index}`}
                tiltak={tiltak}
                allRisikoscenarioList={allRisikoscenarioList}
                setTiltakList={setTiltakList}
                tiltakList={tiltakList}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export const TiltakReadMoreContent: FunctionComponent<TContentProps> = ({
  tiltak,
  allRisikoscenarioList,
  setTiltakList,
  tiltakList,
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
      })
  }

  return (
    <ReadMore header={tiltak.navn} className='mb-3'>
      <TiltakView tiltak={tiltak} risikoscenarioList={allRisikoscenarioList} />
      <Button
        type='button'
        variant='tertiary'
        size='small'
        icon={<PencilIcon title='' aria-hidden />}
        onClick={() => setIsEditModalOpen(true)}
      >
        Rediger tiltak
      </Button>
      {isEditModalOpen && (
        <Modal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          header={{ heading: 'Rediger tiltak' }}
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
    </ReadMore>
  )
}

export default TiltakReadMoreListModalEdit
