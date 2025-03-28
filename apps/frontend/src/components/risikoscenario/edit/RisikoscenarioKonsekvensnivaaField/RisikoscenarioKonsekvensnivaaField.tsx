import { RisikoscenarioKonsekvensnivaHeader } from '../../common/KravRisikoscenarioHeaders'
import { RisikoscenarioKonsekvensnivaaBegrunnelsesField } from './RisikoscenarioKonsekvensnivaaBegrunnelsesField'
import { RisikoscenarioKonsekvensnivaaNivaaRadioField } from './RisikoscenarioKonsekvensnivaaNivaaRadioField'
import RisikoscenarioKonsekvensnivaaReadMore from './RisikoscenarioKonsekvensnivaaReadMore'

export const RisikoscenarioKonsekvensnivaaField = () => (
  <>
    <RisikoscenarioKonsekvensnivaHeader />

    <RisikoscenarioKonsekvensnivaaReadMore />

    <RisikoscenarioKonsekvensnivaaNivaaRadioField />

    <RisikoscenarioKonsekvensnivaaBegrunnelsesField />
  </>
)
