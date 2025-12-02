'use client'

import { mapTiltakToFormValue, updateTiltak } from '@/api/tiltak/tiltakApi'
import AccordianAlertModal from '@/components/common/accordianAlertModal'
import TiltakView from '@/components/tiltak/common/tiltakView'
import TiltakForm from '@/components/tiltak/form/tiltakForm'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  pvkDokumentasjonTabFilterTiltakUrl,
  pvkDokumentasjonTabFilterUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { PencilIcon } from '@navikt/aksel-icons'
import { Accordion, Button, Modal, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import IverksattTiltakForm from '../form/iverksattTiltakForm'

type TProps = {
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  filteredTiltakList: ITiltak[]
  setFilteredTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  formRef: RefObject<any>
}

type TContentProps = {
  tiltak: ITiltak
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  filteredTiltakList: ITiltak[]
  setFilteredTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  formRef: RefObject<any>
}

export const TiltakAccordionList: FunctionComponent<TProps> = ({
  tiltakList,
  setTiltakList,
  filteredTiltakList,
  setFilteredTiltakList,
  risikoscenarioList,
  formRef,
}) => {
  const now = new Date()

  const router = useRouter()
  const queryParams = useSearchParams()
  const steg: string | null = queryParams.get('steg')
  const tiltakId: string | null = queryParams.get('tiltak')
  const filter: string | null = queryParams.get('filter')
  const tabQuery: string | null = queryParams.get('tab')
  const accordionRef = useRef<HTMLButtonElement>(null)
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')

  useEffect(() => {
    if (tiltakId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(tiltakId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (tiltakId?: string): void => {
    if (tiltakId) {
      setNavigateUrl(pvkDokumentasjonTabFilterTiltakUrl(steg, tabQuery, filter, tiltakId))
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(pvkDokumentasjonTabFilterTiltakUrl(steg, tabQuery, filter, tiltakId), {
          scroll: false,
        })
      }
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      setNavigateUrl(pvkDokumentasjonTabFilterUrl(steg, tabQuery))
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(pvkDokumentasjonTabFilterUrl(steg, tabQuery), { scroll: false })
      }
    }
  }

  return (
    <div>
      <Accordion>
        {filteredTiltakList.map((tiltak, index) => {
          const expanded: boolean = tiltakId === tiltak.id
          return (
            <Accordion.Item
              key={`${index}_${tiltak.navn}`}
              id={tiltak.id}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? tiltak.id : undefined)
              }}
            >
              <Accordion.Header ref={expanded ? accordionRef : undefined}>
                {tiltak.navn}{' '}
                <div className='flex gap-2'>
                  {!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name && (
                    <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>
                  )}
                  {!tiltak.frist && <Tag variant='alt2'>Tiltaksfrist savnes</Tag>}
                  {moment(now).isAfter(moment(tiltak.frist)) && (
                    <Tag variant='warning'>Tiltaksfrist utgått</Tag>
                  )}
                </div>
              </Accordion.Header>
              {expanded && (
                <Accordion.Content>
                  <TiltakAccordionContent
                    tiltak={tiltak}
                    risikoscenarioList={risikoscenarioList}
                    tiltakList={tiltakList}
                    filteredTiltakList={filteredTiltakList}
                    setTiltakList={setTiltakList}
                    setFilteredTiltakList={setFilteredTiltakList}
                    formRef={formRef}
                  />
                </Accordion.Content>
              )}
            </Accordion.Item>
          )
        })}
      </Accordion>

      <AccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export const TiltakAccordionContent: FunctionComponent<TContentProps> = ({
  tiltak,
  risikoscenarioList,
  tiltakList,
  setTiltakList,
  filteredTiltakList,
  setFilteredTiltakList,
  formRef,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [iverksattFormDirty, setIverksattFormDirty] = useState<boolean>(false)

  const submit = async (submitedValues: ITiltak) => {
    await updateTiltak(submitedValues)
      .then((response) => {
        setFilteredTiltakList(
          filteredTiltakList.map((tiltak) => {
            if (tiltak.id === response.id) {
              return { ...response }
            } else {
              return tiltak
            }
          })
        )
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
        setIverksattFormDirty(false)
      })
  }

  return (
    <div>
      <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
      {!iverksattFormDirty && (
        <div className='mb-5'>
          <Button
            type='button'
            variant='tertiary'
            size='small'
            icon={<PencilIcon title='' aria-hidden />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Rediger tiltak
          </Button>
        </div>
      )}

      <IverksattTiltakForm
        tiltak={tiltak}
        submit={submit}
        setIverksattFormDirty={setIverksattFormDirty}
        formRef={formRef}
      />

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
              formRef={formRef}
              close={() => setIsEditModalOpen(false)}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}

export default TiltakAccordionList
