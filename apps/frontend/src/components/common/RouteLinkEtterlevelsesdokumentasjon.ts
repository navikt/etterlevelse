import { kravUrl } from './RouteLinkKrav'

export const temaUrl: string = '/tema'

export const etterlevelseUrl = '/etterlevelse'
export const dokumentasjonUrl = '/dokumentasjon'
export const etterlevelseDokumentasjonCreateUrl = `${dokumentasjonUrl}/create`
export const etterlevelseDokumentasjonGjenbrukUrl = `${dokumentasjonUrl}/gjenbruk`

export const etterlevelsesDokumentasjonEditUrl = (etterlevelseDokumentasjonId?: string): string => {
  const url: string = `${dokumentasjonUrl}/edit`

  if (etterlevelseDokumentasjonId) {
    return `${url}/${etterlevelseDokumentasjonId}`
  }

  return url
}

export const etterlevelseDokumentasjonIdUrl = (etterlevelseDokumentasjonId?: string): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonAlleUrl = (
  etterlevelseDokumentasjonId: string | undefined
): string => `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/ALLE`

export const etterlevelseDokumentasjonTemaUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string | undefined
): string => `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/${tema}`

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

export const etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl = (
  etterlevelseDokumentasjonId: string,
  temaCode: string | undefined,
  kravStatusFilter: string,
  kravNummer: number,
  kravVersjon: number
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/${temaCode}/${kravStatusFilter}${kravUrl}/${kravNummer}/${kravVersjon}`

export const etterlevelseDokumentasjonerUrl = (tab?: string): string => {
  const url: string = '/dokumentasjoner'

  if (tab) {
    return `${url}/${tab}`
  }

  return url
}
