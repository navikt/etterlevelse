import { TextAreaField } from '../../../common/Inputs'

export const RisikoscenarioKonsekvensnivaaBegrunnelsesField = () => (
  <div className='mt-3'>
    <TextAreaField
      rows={3}
      noPlaceholder
      label='Begrunn konsekvensnivået'
      name='konsekvensNivaaBegrunnelse'
    />
  </div>
)
