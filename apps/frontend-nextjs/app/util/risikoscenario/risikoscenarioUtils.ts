import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'

export const getKonsekvenssnivaaText = (konsekvensnivaa: number) => {
  switch (konsekvensnivaa) {
    case 1:
      return '1 - Ubetydelig konsekvens'
    case 2:
      return '2 - Lav konsekvens'
    case 3:
      return '3 - Moderat konsekvens'
    case 4:
      return '4 - Alvorlig konsekvens'
    case 5:
      return '5 - Svært alvorlig konsekvens'
    default:
      return 'Ingen konsekvensnivå satt'
  }
}

export const getSannsynlighetsnivaaText = (sannsynlighetsnivaa: number) => {
  switch (sannsynlighetsnivaa) {
    case 1:
      return '1 - Meget lite sannsynlig'
    case 2:
      return '2 - Lite sannsynlig'
    case 3:
      return '3 - Moderat sannsynlig'
    case 4:
      return '4 - Sannsynlig'
    case 5:
      return '5 - Nesten sikkert'
    default:
      return 'Ingen sannsynlighetsnivå satt'
  }
}

export const risikoscenarioFieldCheck = (risiko: IRisikoscenario): boolean =>
  risiko.beskrivelse !== '' &&
  risiko.konsekvensNivaa !== 0 &&
  risiko.konsekvensNivaaBegrunnelse !== '' &&
  risiko.sannsynlighetsNivaa !== 0 &&
  risiko.sannsynlighetsNivaaBegrunnelse !== ''

export const isRisikoUnderarbeidCheck = (risiko: IRisikoscenario): boolean =>
  risiko.beskrivelse === '' ||
  risiko.konsekvensNivaa === 0 ||
  risiko.sannsynlighetsNivaa === 0 ||
  risiko.konsekvensNivaaBegrunnelse === '' ||
  risiko.sannsynlighetsNivaaBegrunnelse === '' ||
  (risiko.tiltakIds.length === 0 && !risiko.ingenTiltak)
