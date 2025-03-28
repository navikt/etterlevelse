import { RisikoscenarioKonsekvensnivaHeader } from '../../common/KravRisikoscenarioHeaders'
import { RisikoscenarioKonsekvensnivaaBegrunnelsesField } from './RisikoscenarioKonsekvensnivaaBegrunnelsesField'
import { RisikoscenarioKonsekvensnivaaNivaa } from './RisikoscenarioKonsekvensnivaaNivaa'
import RisikoscenarioKonsekvensnivaaReadMore from './RisikoscenarioKonsekvensnivaaReadMore'

export const RisikoscenarioKonsekvensnivaaField = () => (
  <>
    <RisikoscenarioKonsekvensnivaHeader />

    <RisikoscenarioKonsekvensnivaaReadMore />

    <RisikoscenarioKonsekvensnivaaNivaa />

    <RisikoscenarioKonsekvensnivaaBegrunnelsesField />
  </>
)
