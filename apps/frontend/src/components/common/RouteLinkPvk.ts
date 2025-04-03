export const pvkEditUrl = (etterlevelseDokumentasjonId: string) =>
  `/dokumentasjon/edit/${etterlevelseDokumentasjonId}`

export const pvkDokumentasjonUrl = (
  etterlevelseDokumentId: string,
  pvkDokumentId: string,
  step: number
): string => `/dokumentasjon/${etterlevelseDokumentId}/pvkdokument/${pvkDokumentId}/${step}`

export const pvkDokumentasjonCopyUrl = (
  locationOrigin: string,
  etterlevelseDokumentasjonId: string,
  pvkDokumentId: string,
  stepUrl: string,
  queryUrl: string
): string =>
  `${locationOrigin}/dokumentasjon/${etterlevelseDokumentasjonId}/pvkdokument/${pvkDokumentId}/${stepUrl}?${queryUrl}`

export const pvkDokumentasjonBehandlingsenLivslopUrl = (
  etterlevelseDokumentId: string,
  behandlingensLivslopId: string
): string =>
  `/dokumentasjon/${etterlevelseDokumentId}/behandlingens-livslop/${behandlingensLivslopId}`

export const pvkDokumentasjonPvkBehovUrl = (
  etterlevelseDokumentId: string,
  pvkId: string
): string => `/dokumentasjon/${etterlevelseDokumentId}/pvkbehov/${pvkId}`

export const risikoscenarioUrl = (pathname: string, risikoId: string): string =>
  `${pathname}?risikoscernario=${risikoId}`

export const risikoscenarioTiltakUrl = (
  pathname: string,
  activeRisikoscenarioId: string,
  tiltakId: string
): string => `${pathname}?risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`

export const pvkDokumenteringPvoTilbakemeldingUrl = (pvkDokumentId: string) =>
  `/pvkdokument/${pvkDokumentId}/pvotilbakemelding/5`
