export const behandlingUrl: string = '/behandling'
export const behandlingensArtOgOmfang: string = '/behandlingens-art-og-omfang'
export const behandlingensLivslop: string = '/behandlingens-livslop'

export const behandlingskatalogenProcessUrl = (
  pollyBaseUrl: string,
  behandlingId: string
): string => `${pollyBaseUrl}process/${behandlingId}`
