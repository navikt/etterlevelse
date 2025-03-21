import { RisikoscenarioSannsynlighetHeader } from '../KravRisikoscenarioHeaders'
import { RisikoscenarioBegrunnelse } from './RisikoscenarioBegrunnelse'
import RisikoscenarioSannsynligNivaa from './RisikoscenarioSannsynligNivaa'
import { RisikoscenarioSannsynlighetReadMore } from './RisikoscenarioSannsynlighetReadMore'

export const RisikoscenarioSannsynlighet = () => (
  <>
    <RisikoscenarioSannsynlighetHeader />

    <RisikoscenarioSannsynlighetReadMore />

    <RisikoscenarioSannsynligNivaa />

    <RisikoscenarioBegrunnelse />
  </>
)

export default RisikoscenarioSannsynlighet
