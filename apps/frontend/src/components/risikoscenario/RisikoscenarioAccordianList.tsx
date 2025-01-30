import { Accordion } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import AccordianAlertModal from './AccordianAlertModal'
import RisikoscenarioAccordionContent from './RisikoscenarioAccordianContent'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from './RisikoscenarioAccordionHeader'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  formRef: RefObject<any>
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const {
    risikoscenarioList,
    allRisikoscenarioList,
    tiltakList,
    setTiltakList,
    setRisikoscenarioList,
    formRef,
  } = props
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
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
              <IdentifiseringAvRisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                {expanded && (
                  <RisikoscenarioAccordionContent
                    risikoscenario={risikoscenario}
                    risikoscenarioer={risikoscenarioList}
                    allRisikoscenarioList={allRisikoscenarioList}
                    tiltakList={tiltakList}
                    setTiltakList={setTiltakList}
                    setRisikoscenarioer={setRisikoscenarioList}
                    formRef={formRef}
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
