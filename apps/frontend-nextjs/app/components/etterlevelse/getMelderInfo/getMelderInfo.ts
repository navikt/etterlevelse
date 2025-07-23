import {
  ETilbakemeldingMeldingStatus,
  ETilbakemeldingRolle,
  ITilbakemelding,
} from '@/constants/tilbakemelding/tilbakemeldingConstants'
import { user } from '@/services/user/userService'

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

export const getMelderInfo = (tilbakemelding: ITilbakemelding) => {
  const sistMelding = tilbakemelding.meldinger[tilbakemelding.meldinger.length - 1]
  const status = getStatus(tilbakemelding)
  const melder = user.getIdent() === tilbakemelding.melderIdent
  const rolle =
    tilbakemelding?.melderIdent === user.getIdent()
      ? ETilbakemeldingRolle.MELDER
      : ETilbakemeldingRolle.KRAVEIER
  const melderOrKraveier = melder || user.isKraveier()
  const ubesvartOgKraveier = status === ETilbakemeldingMeldingStatus.UBESVART && user.isKraveier()
  const kanSkrive =
    (status === ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.KRAVEIER) ||
    (status !== ETilbakemeldingMeldingStatus.UBESVART && rolle === ETilbakemeldingRolle.MELDER)
  return { status, ubesvartOgKraveier, rolle, melder, melderOrKraveier, sistMelding, kanSkrive }
}
