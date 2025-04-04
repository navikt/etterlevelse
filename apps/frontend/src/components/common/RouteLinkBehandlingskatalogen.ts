export const behandlingskatalogenProcessUrl = (
  pollyBaseUrl: string,
  behandlingId: string
): string => `${pollyBaseUrl}process/${behandlingId}`

export const behandlingskatalogenBehandlingsIdUrl = (behandlingId: string): string =>
  `/dokumentasjoner/behandlingsok?behandlingId=${behandlingId}`
