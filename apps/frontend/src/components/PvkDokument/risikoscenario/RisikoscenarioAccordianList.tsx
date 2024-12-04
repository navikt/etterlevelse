import { Accordion } from '@navikt/ds-react'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const { risikoscenarioList } = props
  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario, index) => (
          <Accordion.Item key={index + '_' + risikoscenario.navn}>
            <Accordion.Header>{risikoscenario.navn}</Accordion.Header>
            <Accordion.Content>test content</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianList
