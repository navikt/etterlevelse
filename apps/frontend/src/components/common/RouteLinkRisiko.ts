export const risikoDokumentasjonTemaKravNummerVersjonUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string,
  kravNummer: number,
  kravVersjon: number
): string =>
  `/dokumentasjon/${etterlevelseDokumentasjonId}/${tema}/RELEVANTE_KRAV/krav/${kravNummer}/${kravVersjon}`

export const risikoscenarioFilterAlleUrl = (): string => `?tab=risikoscenarioer&filter=alle`
