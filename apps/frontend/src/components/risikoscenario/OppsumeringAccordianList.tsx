import { Accordion } from '@navikt/ds-react'
import { IRisikoscenario } from '../../constants'
import OppsumeringAccordianContent from './OppsumeringAccordianContent'
import RisikoscenarioAccordianHeader from './RisikoscenarioAccordionHeader'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  defaultOpen?: boolean
}

export const OppsumeringAccordianList = (props: IProps) => {
  const { risikoscenarioList, setRisikoscenarioList, defaultOpen } = props

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
              <OppsumeringAccordianContent
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
export default OppsumeringAccordianList
