import { Accordion } from '@navikt/ds-react/esm/accordion'
import { IRisikoscenario } from '../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
}

export const RisikoscenarioAccordianHeader = (props: IProps) => {
  const { risikoscenario } = props
  return <Accordion.Header>{risikoscenario.navn}</Accordion.Header>
}
export default RisikoscenarioAccordianHeader
