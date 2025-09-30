export const dokumentasjonUrl = '/dokumentasjon'

export const etterlevelseDokumentasjonIdUrl = (etterlevelseDokumentasjonId?: string): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonerUrl = (tab?: string): string => {
  const url: string = `${dokumentasjonUrl}er`

  if (tab) {
    return `${url}?tab=${tab}`
  }

  return url
}
