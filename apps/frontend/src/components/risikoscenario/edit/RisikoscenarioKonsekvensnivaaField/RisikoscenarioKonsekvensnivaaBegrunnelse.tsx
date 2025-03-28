import { TextAreaField } from '../../../common/Inputs'

export const RisikoscenarioKonsekvensnivaa = () => (
  <div className="mt-3">
    <TextAreaField
      rows={3}
      noPlaceholder
      label="Begrunn konsekvensnivået"
      name="konsekvensNivaaBegrunnelse"
    />
  </div>
)
