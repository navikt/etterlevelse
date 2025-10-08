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

export const etterlevelseDokumentasjonAlleOpenUrl = (
  etterlevelseDokumentasjonId: string | undefined
): string => `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}?tema=all-open`

export const etterlevelseDokumentasjonAlleClosedUrl = (
  etterlevelseDokumentasjonId: string | undefined
): string => `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}?tema=all-closed`

export const etterlevelseDokumentasjonTemaUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string | undefined
): string => `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}?tema=${tema}`
