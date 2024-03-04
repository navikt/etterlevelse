import { ETilbakemeldingMeldingStatus } from '../../../constants'

export const tilbakemeldingStatusToText = (status: ETilbakemeldingMeldingStatus) => {
  switch (status) {
    case ETilbakemeldingMeldingStatus.BESVART:
      return 'Besvart'
    case ETilbakemeldingMeldingStatus.UBESVART:
      return 'Ubesvart'
    case ETilbakemeldingMeldingStatus.MIDLERTIDLIG_SVAR:
      return 'Midlertidlig svar'
    default:
      return ''
  }
}

export const getParsedOptionsforTilbakeMelding = () => {
  return Object.values(ETilbakemeldingMeldingStatus).map((status: ETilbakemeldingMeldingStatus) => {
    return {
      id: status,
      label: tilbakemeldingStatusToText(status),
    }
  })
}

export const getTilbakeMeldingStatusToOption = (status: ETilbakemeldingMeldingStatus) => {
  return [
    {
      id: status,
      label: tilbakemeldingStatusToText(status),
    },
  ]
}
