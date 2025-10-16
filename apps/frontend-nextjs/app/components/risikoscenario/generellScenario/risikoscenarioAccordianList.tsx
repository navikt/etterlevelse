'use client'

import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Accordion } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import RisikoscenarioAccordianAlertModal from '../common/risikoscenarioAccordianAlertModal'
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

export const RisikoscenarioAccordianList: FunctionComponent<TProps> = ({
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

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)
        if (element) {
          element.focus()
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
                  />
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>

      <RisikoscenarioAccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export default RisikoscenarioAccordianList
