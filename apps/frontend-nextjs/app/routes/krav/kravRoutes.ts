export const kravUrl: string = '/krav'
export const kravlisteUrl: string = `${kravUrl}liste`

export const kravlisteQueryUrl = (tabQuery?: string): string => {
  if (tabQuery) {
    return `${kravlisteUrl}/${tabQuery}`
  }

  return kravlisteUrl
}

export const kravlisteOpprettUrl = () => `${kravlisteUrl}/opprett`
export const kravRedigeringIdUrl = (kravId?: string): string => {
  const url: string = `${kravUrl}/redigering`
  if (kravId) {
    return `${url}/${kravId}`
  }
  return url
}

export const kravNyVersjonIdUrl = (kravId?: string): string => {
  const url: string = `${kravUrl}/ny-versjon`
  if (kravId) {
    return `${url}/${kravId}`
  }
  return url
}

export const kravPathUrl = (currentPath: string, nextKravPath: string): string =>
  `${currentPath}${kravUrl}${nextKravPath}`

export const kravRelevanteUrl = (tema: string): string => `/${tema}/RELEVANTE_KRAV`

export const kravTemaFilterUrl = (tema: string, filter: string): string => `${tema}/${filter}`

export const kravNummerUrl = (kravNummer: string): string => `${kravUrl}/${kravNummer}`

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
