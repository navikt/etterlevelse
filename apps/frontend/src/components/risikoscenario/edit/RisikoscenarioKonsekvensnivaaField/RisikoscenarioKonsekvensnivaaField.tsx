import { RisikoscenarioKonsekvensnivaHeader } from '../../common/KravRisikoscenarioHeaders'
import RisikoscenarioKonsekvensnivaaReadMore from '../../common/RisikoscenarioKonsekvensnivaaReadMore'
import { RisikoscenarioKonsekvensnivaaBegrunnelsesField } from './RisikoscenarioKonsekvensnivaaBegrunnelsesField'
import { RisikoscenarioKonsekvensnivaaNivaaRadioField } from './RisikoscenarioKonsekvensnivaaNivaaRadioField'

export const RisikoscenarioKonsekvensnivaaField = () => (
  <>
    <RisikoscenarioKonsekvensnivaHeader />

    <RisikoscenarioKonsekvensnivaaReadMore />

    <RisikoscenarioKonsekvensnivaaNivaaRadioField />

    <RisikoscenarioKonsekvensnivaaBegrunnelsesField />
  </>
)
