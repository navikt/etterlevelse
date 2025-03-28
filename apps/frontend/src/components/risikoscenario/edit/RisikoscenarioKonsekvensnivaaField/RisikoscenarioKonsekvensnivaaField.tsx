import { RisikoscenarioKonsekvensnivaHeader } from '../../common/KravRisikoscenarioHeaders'
import { RisikoscenarioKonsekvensnivaaNivaa } from './RisikoscenarioKonsekvensnivaaNivaa'
import RisikoscenarioKonsekvensnivaaReadMore from './RisikoscenarioKonsekvensnivaaReadMore'

export const RisikoscenarioKonsekvensnivaaField = () => (
  <>
    <RisikoscenarioKonsekvensnivaHeader />

    <RisikoscenarioKonsekvensnivaaReadMore />

    <RisikoscenarioKonsekvensnivaaNivaa />

    <RisikoscenarioKonsekvensnivaaField />
  </>
)
