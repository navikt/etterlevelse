import { TilbakemeldingMeldingStatus } from "../../../constants"

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