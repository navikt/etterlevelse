export const adminKravUrl = (): string => '/admin/krav'
export const adminDokumentasjonUrl = (): string => '/admin/dokumentasjon'
export const adminDokumentrelasjonUrl = (): string => '/admin/dokumentrelasjon'
export const adminEtterlevelseUrl = (): string => '/admin/etterlevelse'
export const adminArkivUrl = (): string => '/admin/arkiv'
export const adminCodelistUrl = (): string => '/admin/codelist'
export const adminMessagesLogUrl = (): string => '/admin/messageslog'
export const adminVarselUrl = (): string => '/admin/varsel'
export const adminMaillog = (): string => '/admin/maillog'
export const forbiddenUrl = (): string => '/forbidden'

export const adminAuditUrl = (id?: string): string => {
  const url: string = '/admin/audit'

  if (id) {
    return `${url}/${id}`
  }

  return url
}

export const adminCodelist = (listname: string): string => `/admin/codelist/${listname}`
