export const adminKravUrl = '/admin/krav'
export const adminDokumentasjonUrl = '/admin/dokumentasjon'
export const adminDokumentrelasjonUrl = '/admin/dokumentrelasjon'
export const adminEtterlevelseUrl = '/admin/etterlevelse'
export const adminArkivUrl = '/admin/arkiv'
export const adminCodelistUrl = '/admin/codelist'
export const adminMessagesLogUrl = '/admin/messageslog'
export const adminVarselUrl = '/admin/varsel'
export const adminMaillog = '/admin/maillog'
export const forbiddenUrl = '/forbidden'

export const adminAuditUrl = (id?: string): string => {
  const url: string = '/admin/audit'

  if (id) {
    return `${url}/${id}`
  }

  return url
}

export const adminCodelist = (listname: string): string => `/admin/codelist/${listname}`
