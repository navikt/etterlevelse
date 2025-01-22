import { Accordion } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario } from '../../../constants'
import AccordianAlertModal from '../AccordianAlertModal'
import RisikoscenarioAccordianHeader from '../RisikoscenarioAccordionHeader'
import OppsumeringAccordianContent from './OppsumeringAccordianContent'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  formRef: RefObject<any>
  isUnsaved: boolean
  setIsUnsaved: (state: boolean) => void
}

export const OppsumeringAccordianList = (props: IProps) => {
  const { risikoscenarioList, formRef, isUnsaved, setIsUnsaved } = props
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
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
      setNavigateUrl(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
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
        {risikoscenarioList.map((risikoscenario, index) => {
          const expanded = risikoscenarioId === risikoscenario.id
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={index + '_' + risikoscenario.navn}
              open={expanded}
              onOpenChange={(open) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                <OppsumeringAccordianContent risikoscenario={risikoscenario} formRef={formRef} />
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
