'use client'

import { dokumentasjonUrl } from '../etterlevelseDokumentasjonRoutes'

export const personvernKonsekvensvurderingUrl = '/pvkdokument'

export const etterlevelseDokumentasjonPvkTabUrl = (etterlevelseDokumentasjonId: string): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}?tab=pvk`

export const pvkDokumentasjonStepUrl = (
  etterlevelseDokumentId: string | undefined,
  pvkDokumentId: number | string | undefined,
  step: number | string,
  filter?: string
): string => {
  const url: string = `${dokumentasjonUrl}/${etterlevelseDokumentId}${personvernKonsekvensvurderingUrl}/${pvkDokumentId}?steg=${step}`

  if (filter) {
    return `${url}${filter}`
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
    return `${url}?steg=${step}`
  }

  return url
}
export const pvkDokumentasjonCopyUrl = (
  locationOrigin: string,
  etterlevelseDokumentasjonId: string,
  pvkDokumentId: string,
  queryUrl: string
): string =>
  `${locationOrigin}${dokumentasjonUrl}/${etterlevelseDokumentasjonId}${personvernKonsekvensvurderingUrl}/${pvkDokumentId}?&${queryUrl}`

export const pvkDokumentasjonBehandlingsenLivslopUrl = (
  etterlevelseDokumentId: string,
  behandlingensLivslopId?: string
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentId}/behandlingens-livslop/${behandlingensLivslopId}`

export const pvkDokumentasjonBehandlingsenArtOgOmfangUrl = (
  etterlevelseDokumentId: string,
  behandlingensArtOgOmfangId: string
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentId}/behandlingens-art-og-omfang/${behandlingensArtOgOmfangId}`

export const pvkDokumentasjonPvkBehovUrl = (
  etterlevelseDokumentId: string,
  pvkId: string
): string => `${dokumentasjonUrl}/${etterlevelseDokumentId}/pvkbehov/${pvkId}`

export const risikoscenarioUrl = (risikoId: string, steg?: string): string => {
  if (steg !== undefined) {
    return `${window.location.pathname}?steg=${steg}&risikoscenario=${risikoId}`
  } else {
    return `${window.location.pathname}?risikoscenario=${risikoId}`
  }
}

export const risikoscenarioTiltakUrl = (
  steg: string,
  activeRisikoscenarioId: string,
  tiltakId: string
): string => {
  if (steg !== undefined) {
    return `${window.location.pathname}?steg=${steg}&risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`
  } else {
    return `${window.location.pathname}?srisikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`
  }
}

export const pvkDokumenteringPvoTilbakemeldingUrl = (
  pvkDokumentId: string | undefined,
  step: number,
  filter?: string
): string => {
  const url: string = `${personvernKonsekvensvurderingUrl}/${pvkDokumentId}/pvotilbakemelding?steg=${step}`

  if (filter) {
    return `${url}${filter}`
  }

  return url
}

export const pvkDokumentasjonTabFilterRisikoscenarioUrl = (
  steg: string | null,
  tabQuery: string | null,
  filter?: string | null,
  risikoscenarioId?: string | null
): string => {
  const url: string = `${window.location.pathname}?steg=${steg}&tab=${tabQuery}&filter=${filter}`

  if (risikoscenarioId) {
    return `${url}&risikoscenario=${risikoscenarioId}`
  }

  return url
}

export const pvkDokumentasjonTabFilterTiltakUrl = (
  steg: string | null,
  tabQuery: string | null,
  filter?: string | null,
  tiltakId?: string | null
): string => {
  let url: string = `${window.location.pathname}?steg=${steg}&tab=${tabQuery}`

  if (filter) {
    url += `&filter=${filter}`
  }

  if (tiltakId) {
    url += `&tiltak=${tiltakId}`
  }
  return url
}

export const pvkDokumentasjonTabFilterUrl = (
  steg: string | null,
  tabQuery: string | null,
  filter?: string | null
): string => {
  const url: string = `${window.location.pathname}?steg=${steg}&tab=${tabQuery}`

  if (filter) {
    return `${url}&filter=${filter}`
  }

  return url
}
