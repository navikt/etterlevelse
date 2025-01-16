import { Accordion } from '@navikt/ds-react'
import { useEffect } from 'react'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioAccordionContent from './RisikoscenarioAccordianContent'
import RisikoscenarioAccordianHeader from './RisikoscenarioAccordionHeader'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  defaultOpen?: boolean
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const { risikoscenarioList, setRisikoscenarioList, defaultOpen } = props
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.getElementById(window.location.hash.substring(1))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario, index) => (
          <Accordion.Item
            id={risikoscenario.id}
            key={index + '_' + risikoscenario.navn}
            defaultOpen={defaultOpen}
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
        ))}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianList
