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

export const isRisikoUnderarbeidCheck = (risiko: IRisikoscenario) =>
  risiko.beskrivelse === '' ||
  risiko.konsekvensNivaa === 0 ||
  risiko.sannsynlighetsNivaa === 0 ||
  risiko.konsekvensNivaaBegrunnelse === '' ||
  risiko.sannsynlighetsNivaaBegrunnelse === '' ||
  (risiko.tiltakIds.length === 0 && !risiko.ingenTiltak)
