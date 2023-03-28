import {TilbakemeldingMeldingStatus} from '../../../constants'

export const tilbakemeldingStatusToText = (status: TilbakemeldingMeldingStatus) => {
  switch (status) {
    case TilbakemeldingMeldingStatus.BESVART:
      return 'Besvart'
    case TilbakemeldingMeldingStatus.UBESVART:
      return 'Ubesvart'
    case TilbakemeldingMeldingStatus.MIDLERTIDLIG_SVAR:
      return 'Midlertidlig svar'
    default:
      return ''
  }
}

export const getParsedOptionsforTilbakeMelding = () => {
  return Object.values(TilbakemeldingMeldingStatus).map((s: TilbakemeldingMeldingStatus) => {
    return {
      id: s,
      label: tilbakemeldingStatusToText(s),
    }
  })
}

export const getTilbakeMeldingStatusToOption = (status: TilbakemeldingMeldingStatus) => {
  return [
    {
      id: status,
      label: tilbakemeldingStatusToText(status),
    },
  ]
}
