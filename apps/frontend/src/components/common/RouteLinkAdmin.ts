import { dokumentasjonUrl, etterlevelseUrl } from './RouteLinkEtterlevelsesdokumentasjon'
import { kravUrl } from './RouteLinkKrav'

export const adminUrl: string = '/admin'

export const adminKravUrl: string = `${adminUrl}${kravUrl}`
export const adminDokumentasjonUrl: string = `${adminUrl}${dokumentasjonUrl}`
export const adminDokumentrelasjonUrl: string = `${adminUrl}/dokumentrelasjon`
export const adminEtterlevelseUrl: string = `${adminUrl}${etterlevelseUrl}`
export const adminArkivUrl: string = `${adminUrl}/arkiv`
export const adminCodelistUrl: string = `${adminUrl}/codelist`
export const adminMessagesLogUrl: string = `${adminUrl}/messageslog`
export const adminVarselUrl: string = `${adminUrl}/varsel`
export const adminMaillog = `${adminUrl}/maillog`
export const forbiddenUrl: string = '/forbidden'

export const adminAuditUrl = (id?: string): string => {
  const url: string = `${adminUrl}/audit`

  if (id) {
    return `${url}/${id}`
  }

  return url
}

export const adminCodelist = (listname: string): string => `${adminUrl}/codelist/${listname}`
