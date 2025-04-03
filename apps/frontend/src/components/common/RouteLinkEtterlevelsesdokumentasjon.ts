export const etterlevelseDokumentasjonCreateUrl = (): string => '/dokumentasjon/create'

export const etterlevelsesDokumentasjonEditUrl = (etterlevelseDokumentasjonId?: string) =>
  `/dokumentasjon/edit/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonUrl = (etterlevelseDokumentasjonId?: string): string =>
  `/dokumentasjon/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonAlleUrl = (
  etterlevelseDokumentasjonId: string | undefined
): string => `/dokumentasjon/${etterlevelseDokumentasjonId}/ALLE`

export const etterlevelseDokumentasjonTemaUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string | undefined
): string => `/dokumentasjon/${etterlevelseDokumentasjonId}/${tema}`

export const etterlevelseDokumentasjonPvkTabUrl = (etterlevelseDokumentasjonId: string) =>
  `/dokumentasjon/${etterlevelseDokumentasjonId}?tab=pvk`

export const etterlevelseDokumentasjonGjenbrukUrl = (etterlevelseDokumentasjonId: string): string =>
  `/dokumentasjon/gjenbruk/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonRelasjonUrl = (etterlevelseDokumentasjonId: string): string =>
  `/dokumentasjon/relasjon/${etterlevelseDokumentasjonId}`

export const etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl = (
  etterlevelseDokumentasjonId: string,
  temaCode: string | undefined,
  kravStatusFilter: string,
  kravNummer: number,
  kravVersjon: number
): string =>
  `/dokumentasjon/${etterlevelseDokumentasjonId}/${temaCode}/${kravStatusFilter}/krav/${kravNummer}/${kravVersjon}`

export const etterlevelseDokumentasjonerUrl = (tab?: string): string => {
  if (tab) {
    return `/dokumentasjoner/${tab}`
  }

  return `/dokumentasjoner`
}
