import {
  ETilbakemeldingMeldingStatus,
  ETilbakemeldingRolle,
  ITilbakemelding,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'

const getStatus = (tilbakemelding: ITilbakemelding) => {
  let status = ETilbakemeldingMeldingStatus.UBESVART

  if (tilbakemelding.status) {
    status = tilbakemelding.status
  } else {
    if (
      tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1].rolle ===
      ETilbakemeldingRolle.KRAVEIER
    ) {
      status = ETilbakemeldingMeldingStatus.BESVART
    }
  }

  return status
}

export const getMelderInfo = (
  tilbakemelding: ITilbakemelding,
  userIdent: string,
  isKraveier: boolean
) => {
  const sistMelding = tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1]
  const status = getStatus(tilbakemelding)
  const melder = userIdent === tilbakemelding.melderIdent
  const rolle =
    tilbakemelding?.melderIdent === userIdent
      ? ETilbakemeldingRolle.MELDER
      : ETilbakemeldingRolle.KRAVEIER
  const melderOrKraveier = melder || isKraveier
  const ubesvartOgKraveier = status === ETilbakemeldingMeldingStatus.UBESVART && isKraveier
  const kanSkrive =
    (status === ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.KRAVEIER) ||
    (status !== ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.MELDER)
  return { status, ubesvartOgKraveier, rolle, melder, melderOrKraveier, sistMelding, kanSkrive }
}
