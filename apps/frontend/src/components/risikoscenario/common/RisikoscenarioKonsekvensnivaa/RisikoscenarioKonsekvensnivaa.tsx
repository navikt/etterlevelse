import { RisikoscenarioKonsekvensnivaHeader } from '../KravRisikoscenarioHeaders'
import { RisikoscenarioKonsekvensnivaaNivaa } from './RisikoscenarioKonsekvensnivaaNivaa'
import RisikoscenarioKonsekvensnivaaReadMore from './RisikoscenarioKonsekvensnivaaReadMore'

export const RisikoscenarioKonsekvensnivaa = () => (
  <>
    <RisikoscenarioKonsekvensnivaHeader />

    <RisikoscenarioKonsekvensnivaaReadMore />

    <RisikoscenarioKonsekvensnivaaNivaa />

    <RisikoscenarioKonsekvensnivaa />
  </>
)
