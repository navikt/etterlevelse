import { kravUrl } from '@/routes/krav/kravRoutes'

export const etterlevelseUrl = '/etterlevelse'
export const dokumentasjonUrl = '/dokumentasjon'
export const etterlevelseDokumentasjonCreateUrl = `${dokumentasjonUrl}/create`

export const etterlevelseDokumentasjonTemaCodeKravStatusFilterUrl = (
  etterlevelseDokumentasjonId: string,
  temaCode: string | undefined,
  kravNummer: number,
  kravVersjon: number
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/${temaCode}${kravUrl}/${kravNummer}/${kravVersjon}`
