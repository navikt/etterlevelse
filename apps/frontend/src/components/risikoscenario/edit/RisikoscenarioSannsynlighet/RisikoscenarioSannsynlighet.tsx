import { RisikoscenarioSannsynlighetHeader } from '../../common/KravRisikoscenarioHeaders'
import RisikoscenarioSannsynligNivaaRadioField from './RisikoscenarioSannsynligNivaaRadioField'
import { RisikoscenarioSannsynlighetReadMore } from './RisikoscenarioSannsynlighetReadMore'
import { RisikoscenarioSannsynlighetsBegrunnelseField } from './RisikoscenarioSannsynlighetsBegrunnelseField'

export const RisikoscenarioSannsynlighet = () => (
  <>
    <RisikoscenarioSannsynlighetHeader />

    <RisikoscenarioSannsynlighetReadMore />

    <RisikoscenarioSannsynligNivaaRadioField />

    <RisikoscenarioSannsynlighetsBegrunnelseField />
  </>
)

export default RisikoscenarioSannsynlighet
