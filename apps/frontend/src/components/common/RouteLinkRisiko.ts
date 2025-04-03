export const risikoDokumentasjonTemaKravNummerVersjonUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string,
  kravNummer: number,
  kravVersjon: number
) =>
  `/dokumentasjon/${etterlevelseDokumentasjonId}/${tema}/RELEVANTE_KRAV/krav/${kravNummer}/${kravVersjon}`
