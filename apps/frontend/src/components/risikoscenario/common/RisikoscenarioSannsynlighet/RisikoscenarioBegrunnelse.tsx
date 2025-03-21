import { TextAreaField } from '../../../common/Inputs'

export const RisikoscenarioBegrunnelse = () => (
  <div className="mt-3">
    <TextAreaField
      rows={3}
      noPlaceholder
      label="Begrunn sannsynlighetsnivået"
      name="sannsynlighetsNivaaBegrunnelse"
    />
  </div>
)
