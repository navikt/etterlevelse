import { dokumentasjonUrl } from './RouteLinkEtterlevelsesdokumentasjon'

export const pvkdokumentUrl: string = '/pvkdokument'

// Removed: versions URL handled in Next.js app

export const etterlevelseDokumentasjonPvkTabUrl = (etterlevelseDokumentasjonId: string): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}?tab=pvk`

export const pvkDokumentasjonStepUrl = (
  etterlevelseDokumentId: string | undefined,
  pvkDokumentId: number | string | undefined,
  step: number | string,
  filter?: string
): string => {
  const url: string = `${dokumentasjonUrl}/${etterlevelseDokumentId}${pvkdokumentUrl}/${pvkDokumentId}/${step}`

  if (filter) {
    return `${url}/${filter}`
  }

  return url
}

export const pvkDokumentasjonPvkTypeStepUrl = (
  etterlevelseDokumentId: string,
  pvkType: string,
  pvkDokumentId: string,
  step?: number | string
): string => {
  const url: string = `${dokumentasjonUrl}/${etterlevelseDokumentId}/${pvkType}/${pvkDokumentId}`

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
  `${locationOrigin}${dokumentasjonUrl}/${etterlevelseDokumentasjonId}${pvkdokumentUrl}/${pvkDokumentId}/${stepUrl}?${queryUrl}`

export const pvkDokumentasjonBehandlingsenLivslopUrl = (
  etterlevelseDokumentId: string,
  behandlingensLivslopId: string
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentId}/behandlingens-livslop/${behandlingensLivslopId}`

export const pvkDokumentasjonPvkBehovUrl = (
  etterlevelseDokumentId: string,
  pvkId: string
): string => `${dokumentasjonUrl}/${etterlevelseDokumentId}/pvkbehov/${pvkId}`

export const risikoscenarioUrl = (risikoId: string): string =>
  `${window.location.pathname}?risikoscenario=${risikoId}`

export const risikoscenarioTiltakUrl = (activeRisikoscenarioId: string, tiltakId: string): string =>
  `${window.location.pathname}?risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`

export const pvkDokumenteringPvoTilbakemeldingUrl = (
  pvkDokumentId: string | undefined,
  step: number,
  filter?: string
): string => {
  const url: string = `${pvkdokumentUrl}/${pvkDokumentId}/pvotilbakemelding/${step}`

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
