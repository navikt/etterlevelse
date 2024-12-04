import { Accordion } from '@navikt/ds-react'
import { useEffect } from 'react'
import { IRisikoscenario } from '../../../constants'
import RisikoscenarioAccordionContent from './RisikoscenarioAccordianContent'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const { risikoscenarioList } = props

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
          <Accordion.Item id={risikoscenario.id} key={index + '_' + risikoscenario.navn}>
            <Accordion.Header>{risikoscenario.navn}</Accordion.Header>
            <Accordion.Content>
              <RisikoscenarioAccordionContent risikoscenario={risikoscenario} />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianList
