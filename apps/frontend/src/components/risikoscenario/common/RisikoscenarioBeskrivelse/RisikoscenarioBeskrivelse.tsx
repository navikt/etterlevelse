import { TextAreaField } from '../../../common/Inputs'

export const RisikoscenarioBeskrivelse = () => (
  <>
    <TextAreaField
      rows={1}
      name="navn"
      label="Navngi risikoscenariet"
      noPlaceholder
      caption="Velg et navn som gjør scenarioet lett å skille fra andre"
    />

    <div className="mt-3">
      <TextAreaField rows={3} noPlaceholder label="Beskriv risikoscenariet" name="beskrivelse" />
    </div>
  </>
)
