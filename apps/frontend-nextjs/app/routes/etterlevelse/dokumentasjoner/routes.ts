export const etterlevelseDokumentasjonerUrl = (tab?: string): string => {
  const url: string = '/dokumentasjoner'

  if (tab) {
    return `${url}/${tab}`
  }

  return url
}
