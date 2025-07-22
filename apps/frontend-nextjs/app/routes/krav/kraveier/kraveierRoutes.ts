import { kravUrl } from '../kravRoutes'

export const kravlisteUrl = (tabQuery?: string): string => {
  const url: string = `${kravUrl}liste`

  if (tabQuery) {
    return `${url}/${tabQuery}`
  }

  return url
}
