import { RisikoscenarioSannsynlighetHeader } from '../../common/KravRisikoscenarioHeaders'
import { RisikoscenarioSannsynlighetReadMore } from '../../common/RisikoscenarioSannsynlighetReadMore'
import RisikoscenarioSannsynligNivaaRadioField from './RisikoscenarioSannsynligNivaaRadioField'
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
