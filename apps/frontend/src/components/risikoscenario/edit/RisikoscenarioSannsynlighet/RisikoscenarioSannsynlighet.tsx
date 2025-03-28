import { RisikoscenarioSannsynlighetHeader } from '../../common/KravRisikoscenarioHeaders'
import RisikoscenarioSannsynligNivaa from './RisikoscenarioSannsynligNivaa'
import { RisikoscenarioSannsynlighetReadMore } from './RisikoscenarioSannsynlighetReadMore'
import { RisikoscenarioSannsynlighetsBegrunnelseField } from './RisikoscenarioSannsynlighetsBegrunnelseField'

export const RisikoscenarioSannsynlighet = () => (
  <>
    <RisikoscenarioSannsynlighetHeader />

    <RisikoscenarioSannsynlighetReadMore />

    <RisikoscenarioSannsynligNivaa />

    <RisikoscenarioSannsynlighetsBegrunnelseField />
  </>
)

export default RisikoscenarioSannsynlighet
