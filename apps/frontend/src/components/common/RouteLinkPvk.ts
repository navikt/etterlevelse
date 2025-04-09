export const pvkDokumentasjonStepUrl = (
  etterlevelseDokumentId: string | undefined,
  pvkDokumentId: string | undefined,
  step: number,
  filter?: string
): string => {
  const url: string = `/dokumentasjon/${etterlevelseDokumentId}/pvkdokument/${pvkDokumentId}/${step}`

  if (filter) {
    return `${url}/${filter}`
  }

  return url
}

export const pvkDokumentasjonPvkTypeStepUrl = (
  etterlevelseDokumentId: string,
  pvkType: string,
  pvkDokumentId: string,
  step?: number
): string => {
  const url: string = `/dokumentasjon/${etterlevelseDokumentId}/${pvkType}/${pvkDokumentId}`

  if (step) {
    return `${url}/${step}`
  }

  return url
}
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

export const risikoscenarioTiltakUrl = (activeRisikoscenarioId: string, tiltakId: string): string =>
  `${window.location.pathname}?risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`

export const pvkDokumenteringPvoTilbakemeldingUrl = (
  pvkDokumentId: string | undefined,
  step: number,
  filter?: string
): string => {
  const url: string = `/pvkdokument/${pvkDokumentId}/pvotilbakemelding/${step}`

  if (filter) {
    return `${url}${filter}`
  }

  return url
}

export const pvkDokumentasjonTabFilterRisikoscenarioUrl = (
  tabQuery: string | null,
  filter: string | null,
  risikoscenarioId: string | null
): string => {
  const url: string = `${window.location.pathname}?tab=${tabQuery}&filter=${filter}`

  if (risikoscenarioId) {
    return `${url}&risikoscenario=${risikoscenarioId}`
  }

  return url
}

export const pvkDokumentasjonTabFilterUrl = (
  tabQuery: string | null,
  filter: string | null,
  risikoscenarioer: string
): string => {
  const url: string = `${window.location.pathname}?tab=${tabQuery}`

  if (tabQuery === risikoscenarioer) {
    return `${url}&filter=${filter}`
  }

  return url
}
