import { Accordion } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import { risikoscenarioUrl } from '../common/RouteLinkPvk'
import AccordianAlertModal from './AccordianAlertModal'
import { RisikoscenarioAccordionContent } from './RisikoscenarioAccordianContent'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from './RisikoscenarioAccordionHeader'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
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
  const navigate: NavigateFunction = useNavigate()
  const url: URL = new URL(window.location.href)
  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const tiltakId: string | null = url.searchParams.get('tiltak')

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
      setNavigateUrl(risikoscenarioUrl(risikoscenarioId))
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(risikoscenarioUrl(risikoscenarioId))
      }
    } else {
      setNavigateUrl(window.location.pathname)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(window.location.pathname)
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

      <AccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export default RisikoscenarioAccordianList
