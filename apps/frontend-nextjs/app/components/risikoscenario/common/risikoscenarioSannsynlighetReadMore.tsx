import { List, ReadMore } from '@navikt/ds-react'

export const RisikoscenarioSannsynlighetReadMore = () => (
  <ReadMore header='Hva menes med de ulike sannsynlighetsnivåene?' className='my-5'>
    <h2>
      <b>Meget lite sannsynlig</b>
    </h2>
    <List>
      <List.Item>
        Mindre enn 10 prosent sannsynlig og/eller inntreffer hvert 5. år eller sjeldnere.
      </List.Item>
    </List>
    <h2>
      <b>Lite sannsynlig</b>
    </h2>
    <List>
      <List.Item>10–30 prosent sannsynlig og/eller inntreffer hvert år eller sjeldnere.</List.Item>
    </List>
    <h2>
      <b>Moderat sannsynlig:</b>
    </h2>
    <List>
      <List.Item>30–60 prosent sannsynlig og/eller inntreffer 2–4 ganger pr. år.</List.Item>
    </List>
    <h2>
      <b>Sannsynlig</b>
    </h2>
    <List>
      <List.Item>60–90 prosent sannsynlig og/eller inntreffer månedelig.</List.Item>
    </List>
    <h2>
      <b>Nesten sikkert</b>
    </h2>
    <List>
      <List.Item>Over 90 prosent sannsynlig og/eller inntreffer ukentlig.</List.Item>
    </List>
  </ReadMore>
)

export default RisikoscenarioSannsynlighetReadMore
