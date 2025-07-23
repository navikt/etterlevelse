import { EAdresseType } from '@/constants/commonConstants'
import { ETilbakemeldingMeldingStatus } from '@/constants/tilbakemelding/tilbakemeldingConstants'

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

export const getTilbakeMeldingStatusToOption = (status: ETilbakemeldingMeldingStatus) => {
  return [
    {
      id: status,
      label: tilbakemeldingStatusToText(status),
    },
  ]
}

export const getParsedOptionsforTilbakeMelding = () => {
  return Object.values(ETilbakemeldingMeldingStatus).map((status: ETilbakemeldingMeldingStatus) => {
    return {
      id: status,
      label: tilbakemeldingStatusToText(status),
    }
  })
}

export const getMessageType = (type: EAdresseType | undefined) => {
  switch (type) {
    case EAdresseType.EPOST:
      return 'din epost'
    case EAdresseType.SLACK:
      return 'slack kanal'
    case EAdresseType.SLACK_USER:
      return 'din slack bruker'
  }
}
