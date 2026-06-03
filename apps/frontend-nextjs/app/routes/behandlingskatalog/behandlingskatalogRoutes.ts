export const behandlingUrl: string = '/behandling'
export const behandlingerUrl: string = '/behandlinger'
export const behandlingensArtOgOmfang: string = '/behandlingens-art-og-omfang'

export const behandlingskatalogenProcessUrl = (
  pollyBaseUrl: string,
  behandlingId: string
): string => `${pollyBaseUrl}process/${behandlingId}`
