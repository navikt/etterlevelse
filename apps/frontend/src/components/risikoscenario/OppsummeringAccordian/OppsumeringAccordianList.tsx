import { Accordion } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { tabValues } from '../../PvkDokument/OppsummeringAvAlleRisikoscenarioerOgTiltak'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '../../common/RouteLinkPvk'
import RisikoscenarioAccordianAlertModal from '../AccordianAlertModal'
import RisikoscenarioAccordianHeader from '../RisikoscenarioAccordionHeader'
import OppsumeringAccordianContent from './OppsumeringAccordianContent'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
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
  setTiltakList,
  formRef,
  isUnsaved,
  setIsUnsaved,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const url: URL = new URL(window.location.href)
  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const tabQuery: string | null = url.searchParams.get('tab')
  const filterQuery: string | null = url.searchParams.get('filter')
  const accordionRef = useRef<HTMLButtonElement>(null)

  const [navigateUrl, setNavigateUrl] = useState<string>('')

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
        pvkDokumentasjonTabFilterRisikoscenarioUrl(tabQuery, filterQuery, risikoscenarioId)
      )
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(
          pvkDokumentasjonTabFilterRisikoscenarioUrl(tabQuery, filterQuery, risikoscenarioId)
        )
      }
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      setNavigateUrl(
        pvkDokumentasjonTabFilterUrl(tabQuery, filterQuery, tabValues.risikoscenarioer)
      )
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(pvkDokumentasjonTabFilterUrl(tabQuery, filterQuery, tabValues.risikoscenarioer))
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
                  setTiltakList={setTiltakList}
                  formRef={formRef}
                />
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

export default OppsumeringAccordianList
