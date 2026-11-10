'use client'

import { Accordion, List, LocalAlert } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import {
  risikoDokumentasjonTemaKravNummerVersjonUrl,
  risikoscenarioUrl,
} from '@/routes/risikoscenario/risikoscenarioRoutes'
import AccordianAlertModal from '../../common/accordianAlertModal'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from '../common/risikoscenarioAccordionHeader'
import RisikoscenarioAccordionContent from './risikoscenarioAccordionContent'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  etterlevelseDokumentasjonId: string
  setIsTiltakFormActive: (state: boolean) => void
  isIngenTilgangFormDirty: boolean
  setIsIngenTilgangFormDirty: (state: boolean) => void
  formRef: RefObject<any>
  isCreateModalOpen: boolean
}

const RisikoscenarioAccordianList: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  tiltakList,
  etterlevelseDokumentasjonId,
  setTiltakList,
  setRisikoscenarioList,
  setIsTiltakFormActive,
  isIngenTilgangFormDirty,
  setIsIngenTilgangFormDirty,
  formRef,
  isCreateModalOpen,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const queryParams = useSearchParams()
  const risikoscenarioId: string | null = queryParams.get('risikoscenario')
  const tiltakId: string | null = queryParams.get('tiltak')
  const steg: string | undefined = queryParams.get('steg') || undefined

  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const [movedRisikoscenarioAlert, setMovedRisikoscenarioAlert] = useState<{
    risikoscenarioName: string
    kravRefs: IKravReference[]
  } | null>(null)
  const [isAnnouncementReady, setIsAnnouncementReady] = useState(false)

  const handleMovedToKrav = (payload: {
    risikoscenarioName: string
    kravRefs: IKravReference[]
  }) => {
    setIsAnnouncementReady(false)
    setMovedRisikoscenarioAlert(payload)
  }

  useEffect(() => {
    if (!movedRisikoscenarioAlert || movedRisikoscenarioAlert.kravRefs.length === 0) return
    const timeout = setTimeout(() => setIsAnnouncementReady(true), 100)
    return () => clearTimeout(timeout)
  }, [movedRisikoscenarioAlert])

  useEffect(() => {
    // One-shot success message set by the edit flow when a ovrig scenario is connected to a pvk related krav and moved out of this list.
    const storageKey = `pvk:moved-risikoscenario:${etterlevelseDokumentasjonId}`
    const raw = window.sessionStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          risikoscenarioName: string
          kravRefs: IKravReference[]
        }
        if (parsed?.kravRefs?.length) {
          handleMovedToKrav(parsed)
        }
      } finally {
        window.sessionStorage.removeItem(storageKey)
      }
    }
  }, [etterlevelseDokumentasjonId])

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)
        if (element) {
          element
            .querySelector<HTMLButtonElement>('.aksel-accordion__header')
            ?.focus({ preventScroll: true })
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.pageYOffset - 30,
            behavior: 'smooth',
          })
          if (tiltakId) {
            const tiltakElement: HTMLElement | null = document.getElementById(
              `${risikoscenarioId}_${tiltakId}`
            )
            if (tiltakElement) {
              tiltakElement.focus()
              window.scrollTo({
                top: tiltakElement.getBoundingClientRect().top + window.pageYOffset - 30,
                behavior: 'smooth',
              })
            }
          }
        }
      }, 200)
    }
  }, [risikoscenarioId, tiltakId])

  const handleAccordionChange = (risikoscenarioId?: string) => {
    if (risikoscenarioId) {
      setNavigateUrl(risikoscenarioUrl(risikoscenarioId, steg))
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(risikoscenarioUrl(risikoscenarioId, steg), { scroll: false })
      }
    } else {
      setNavigateUrl(`${pathname}?steg=${steg}`)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        router.push(`${pathname}?steg=${steg}`, { scroll: false })
      }
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario: IRisikoscenario, index: number) => {
          const expanded: boolean = risikoscenarioId === risikoscenario.id
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={`${index}_${risikoscenario.navn}`}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <IdentifiseringAvRisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                {expanded && (
                  <RisikoscenarioAccordionContent
                    risikoscenario={risikoscenario}
                    risikoscenarioer={risikoscenarioList}
                    allRisikoscenarioList={allRisikoscenarioList}
                    setAllRisikoscenarioList={setAllRisikoscenarioList}
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                    tiltakList={tiltakList}
                    setTiltakList={setTiltakList}
                    setRisikoscenarioer={setRisikoscenarioList}
                    setIsTiltakFormActive={setIsTiltakFormActive}
                    isIngenTilgangFormDirty={isIngenTilgangFormDirty}
                    setIsIngenTilgangFormDirty={setIsIngenTilgangFormDirty}
                    formRef={formRef}
                    isCreateModalOpen={isCreateModalOpen}
                    onMovedToKrav={handleMovedToKrav}
                  />
                )}
              </Accordion.Content>
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

      {movedRisikoscenarioAlert && movedRisikoscenarioAlert.kravRefs.length > 0 && (
        <LocalAlert
          status='success'
          role='region'
          aria-label='Flytting av risikoscenario'
          className='mt-5 w-full max-w-[75ch] mx-auto'
        >
          <LocalAlert.Header>
            <LocalAlert.Title>
              Risikoscenariet &quot;{movedRisikoscenarioAlert.risikoscenarioName}&quot; er flyttet
              til følgende etterlevelseskrav:
            </LocalAlert.Title>
            <LocalAlert.CloseButton
              onClick={() => {
                setIsAnnouncementReady(false)
                setMovedRisikoscenarioAlert(null)
              }}
            />
          </LocalAlert.Header>
          <LocalAlert.Content>
            <List as='ul'>
              {movedRisikoscenarioAlert.kravRefs.map(
                (relevantKrav: IKravReference, index: number) => {
                  const kravHref: string = risikoDokumentasjonTemaKravNummerVersjonUrl(
                    etterlevelseDokumentasjonId,
                    relevantKrav.temaCode || 'PVK',
                    relevantKrav.kravNummer,
                    relevantKrav.kravVersjon
                  )

                  return (
                    <List.Item
                      className='max-w-[75ch]'
                      key={`${relevantKrav.kravNummer}_${relevantKrav.kravVersjon}_${index}`}
                    >
                      <ExternalLink href={kravHref}>
                        K{relevantKrav.kravNummer}.{relevantKrav.kravVersjon} {relevantKrav.navn}
                      </ExternalLink>
                    </List.Item>
                  )
                }
              )}
            </List>
          </LocalAlert.Content>
        </LocalAlert>
      )}
      <div role='status' aria-atomic='true' className='sr-only'>
        {isAnnouncementReady &&
          movedRisikoscenarioAlert &&
          movedRisikoscenarioAlert.kravRefs.length > 0 && (
            <>
              Risikoscenariet &quot;{movedRisikoscenarioAlert.risikoscenarioName}&quot; er flyttet
              til følgende etterlevelseskrav:{' '}
              {movedRisikoscenarioAlert.kravRefs
                .map((krav) => `K${krav.kravNummer}.${krav.kravVersjon} ${krav.navn}`)
                .join(', ')}
            </>
          )}
      </div>
    </div>
  )
}

export default RisikoscenarioAccordianList
