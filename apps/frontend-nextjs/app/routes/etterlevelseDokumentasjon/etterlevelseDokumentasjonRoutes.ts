export const dokumentasjonUrl = '/dokumentasjon'
export const etterlevelseDokumentasjonGjenbrukUrl = `${dokumentasjonUrl}/gjenbruk`

export const etterlevelseDokumentasjonIdUrl = (etterlevelseDokumentasjonId?: string): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonerUrl = (tab?: string): string => {
  const url: string = `${dokumentasjonUrl}er`

  if (tab) {
    return `${url}?tab=${tab}`
  }

  return url
}

export const etterlevelseDokumentasjonGjenbrukIdUrl = (
  etterlevelseDokumentasjonId: string
): string => `${etterlevelseDokumentasjonGjenbrukUrl}/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonRelasjonUrl = (
  etterlevelseDokumentasjonId?: string
): string => {
  const url: string = `${dokumentasjonUrl}/relasjon`

  if (etterlevelseDokumentasjonId) {
    return `${url}/${etterlevelseDokumentasjonId}`
  }

  return url
}

export const etterlevelsesDokumentasjonEditUrl = (etterlevelseDokumentasjonId?: string): string => {
  const url: string = `${dokumentasjonUrl}/edit`

  if (etterlevelseDokumentasjonId) {
    return `${url}/${etterlevelseDokumentasjonId}`
  }

  return url
}
