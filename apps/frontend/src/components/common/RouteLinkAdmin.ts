export const adminAuditUrl = (id?: string) => {
  const url: string = '/admin/audit'

  if (id) {
    return `${url}/${id}`
  }

  return url
}

export const adminCodelist = (listname: string) => `/admin/codelist/${listname}`
