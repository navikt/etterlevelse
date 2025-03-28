import { RisikoscenarioSannsynlighetHeader } from '../../common/KravRisikoscenarioHeaders'
import RisikoscenarioSannsynligNivaaRadioField from './RisikoscenarioSannsynligNivaaRadioField'
import { RisikoscenarioSannsynlighetReadMore } from './RisikoscenarioSannsynlighetReadMore'
import { RisikoscenarioSannsynlighetsBegrunnelseField } from './RisikoscenarioSannsynlighetsBegrunnelseField'

export const RisikoscenarioSannsynlighetField = () => (
  <>
    <RisikoscenarioSannsynlighetHeader />

    <RisikoscenarioSannsynlighetReadMore />

    <RisikoscenarioSannsynligNivaaRadioField />

    <RisikoscenarioSannsynlighetsBegrunnelseField />
  </>
)

export default RisikoscenarioSannsynlighetField
