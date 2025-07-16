export const kravUrl: string = '/krav'

export const kravNummerVersjonUrl = (
  kravNummer: number | string,
  kravVersjon: number | string,
  tilbakemeldingId?: string
): string => {
  const url: string = `${kravUrl}/${kravNummer}/${kravVersjon}`

  if (tilbakemeldingId) {
    return `${url}?tilbakemeldingId=${tilbakemeldingId}`
  }

  return url
}
