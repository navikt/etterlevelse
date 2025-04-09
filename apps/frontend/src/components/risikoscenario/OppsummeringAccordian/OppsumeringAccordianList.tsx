import { Accordion } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { tabValues } from '../../PvkDokument/OppsummeringAvAlleRisikoscenarioerOgTiltak'
import AccordianAlertModal from '../AccordianAlertModal'
import RisikoscenarioAccordianHeader from '../RisikoscenarioAccordionHeader'
import OppsumeringAccordianContent from './OppsumeringAccordianContent'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  formRef: RefObject<any>
  isUnsaved: boolean
  setIsUnsaved: (state: boolean) => void
}

export const OppsumeringAccordianList: FunctionComponent<TProps> = ({
  risikoscenarioList,
  setRisikosenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  etterlevelseDokumentasjonId,
  tiltakList,
  formRef,
  isUnsaved,
  setIsUnsaved,
}) => {
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url: URL = new URL(window.location.href)
  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const tabQuery: string | null = url.searchParams.get('tab')
  const filterQuery: string | null = url.searchParams.get('filter')
  const navigate: NavigateFunction = useNavigate()
  const accordionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      setNavigateUrl(
        `${window.location.pathname}?tab=${tabQuery}&filter=${filterQuery}&risikoscenario=${risikoscenarioId}`
      )
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(
          `${window.location.pathname}?tab=${tabQuery}&filter=${filterQuery}&risikoscenario=${risikoscenarioId}`
        )
      }
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      const paramQuery: string =
        tabQuery === tabValues.risikoscenarioer ? '&filter=' + filterQuery : ''
      setNavigateUrl(`${window.location.pathname}?tab=${tabQuery}${paramQuery}`)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(`${window.location.pathname}?tab=${tabQuery}${paramQuery}`)
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
              key={`${index}_${risikoscenario.id}`}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
              />
              <Accordion.Content>
                <OppsumeringAccordianContent
                  risikoscenario={risikoscenario}
                  risikoscenarioList={risikoscenarioList}
                  setRisikosenarioList={setRisikosenarioList}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  allRisikoscenarioList={allRisikoscenarioList}
                  setAllRisikoscenarioList={setAllRisikoscenarioList}
                  tiltakList={tiltakList}
                  formRef={formRef}
                />
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

export default OppsumeringAccordianList
