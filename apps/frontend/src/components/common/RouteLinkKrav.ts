export const kravTemaUrl = (): string => '/tema'

export const kravUrl = (currentPath: string, nextKravPath: string): string =>
  `${currentPath}/krav${nextKravPath}`

export const kravRedigeringIdUrl = (kravId: string): string => `/krav/redigering/${kravId}`

export const kravNyVersjonIdUrl = (kravId: string): string => `/krav/ny-versjon/${kravId}`

export const kravRelevanteUrl = (tema: string): string => `/${tema}/RELEVANTE_KRAV`

export const kravlisteUrl = (tabQuery?: string): string => {
  const url: string = '/kravliste'

  if (tabQuery) {
    return `${url}/${tabQuery}`
  }

  return url
}

export const kravTemaFilterUrl = (tema: string, filter: string): string => `${tema}/${filter}`

export const kravNummerUrl = (kravNummer: string): string => `/krav/${kravNummer}`

export const kravNummerVersjonUrl = (
  kravNummer: number | string,
  kravVersjon: number | string,
  tilbakemeldingId?: string
): string => {
  const url: string = `/krav/${kravNummer}/${kravVersjon}`

  if (tilbakemeldingId) {
    return `${url}?tilbakemeldingId=${tilbakemeldingId}`
  }

  return url
}
