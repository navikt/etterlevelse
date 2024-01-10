import axios from 'axios'
import moment from 'moment'
import { AuditAction, IAuditItem, IAuditLog, ObjectType } from '../components/admin/audit/AuditTypes'
import { IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAuditLog = async (id: string) => {
  const auditLog = (await axios.get<IAuditLog>(`${env.backendBaseUrl}/audit/log/${id}`)).data
  auditLog.audits.sort((a, b) => moment(b.time).valueOf() - moment(a.time).valueOf())
  return auditLog
}

export const getAudits = async (page: number, count: number, table?: ObjectType) => {
  return (await axios.get<IPageResponse<IAuditItem>>(`${env.backendBaseUrl}/audit?pageNumber=${page}&pageSize=${count}` + (table ? `&table=${table}` : ''))).data
}

export const getEvents = async (page: number, count: number, table: ObjectType, tableId?: string, action?: AuditAction) => {
  return (
    await axios.get<IPageResponse<Event>>(
      `${env.backendBaseUrl}/event?pageNumber=${page}&pageSize=${count}&table=${table}` + (tableId ? `&tableId=${tableId}` : '') + (action ? `&action=${action}` : ''),
    )
  ).data
}
