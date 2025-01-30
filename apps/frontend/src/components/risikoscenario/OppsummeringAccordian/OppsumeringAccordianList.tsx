import { Accordion } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { tabValues } from '../../PvkDokument/OppsummeringAvAlleRisikoscenarioerOgTiltak'
import AccordianAlertModal from '../AccordianAlertModal'
import RisikoscenarioAccordianHeader from '../RisikoscenarioAccordionHeader'
import OppsumeringAccordianContent from './OppsumeringAccordianContent'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
  formRef: RefObject<any>
  isUnsaved: boolean
  setIsUnsaved: (state: boolean) => void
}

export const OppsumeringAccordianList = (props: IProps) => {
  const {
    risikoscenarioList,
    allRisikoscenarioList,
    tiltakList,
    formRef,
    isUnsaved,
    setIsUnsaved,
  } = props
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const tabQuery = url.searchParams.get('tab')
  const filterQuery = url.searchParams.get('filter')
  const navigate = useNavigate()

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string) => {
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
    } else {
      const paramQuery = tabQuery === tabValues.risikoscenarioer ? '&filter=' + filterQuery : ''
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
        {risikoscenarioList.map((risikoscenario, index) => {
          const expanded = risikoscenarioId === risikoscenario.id
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={index + '_' + risikoscenario.id}
              open={expanded}
              onOpenChange={(open) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                <OppsumeringAccordianContent
                  risikoscenario={risikoscenario}
                  allRisikoscenarioList={allRisikoscenarioList}
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
