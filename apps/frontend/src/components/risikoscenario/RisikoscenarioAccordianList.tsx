import { Accordion } from '@navikt/ds-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioAccordionContent from './RisikoscenarioAccordianContent'
import RisikoscenarioAccordianHeader from './RisikoscenarioAccordionHeader'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const { risikoscenarioList, setRisikoscenarioList } = props
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
      navigate(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
    } else {
      navigate(window.location.pathname)
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
                <RisikoscenarioAccordionContent
                  risikoscenario={risikoscenario}
                  risikoscenarioer={risikoscenarioList}
                  setRisikoscenarioer={setRisikoscenarioList}
                />
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianList
