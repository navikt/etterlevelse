import { adminUrl } from '../routes'

export const adminAuditUrl = (id?: string): string => {
  const url: string = `${adminUrl}/audit`

  if (id) {
    return `${url}/${id}`
  }

  return url
}
