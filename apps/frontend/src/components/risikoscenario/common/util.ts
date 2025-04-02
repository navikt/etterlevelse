import { IRisikoscenario } from '../../../constants'

export const risikoscenarioFieldCheck = (risiko: IRisikoscenario) => {
  return (
    risiko.beskrivelse !== '' &&
    risiko.konsekvensNivaa !== 0 &&
    risiko.konsekvensNivaaBegrunnelse !== '' &&
    risiko.sannsynlighetsNivaa !== 0 &&
    risiko.sannsynlighetsNivaaBegrunnelse !== ''
  )
}
