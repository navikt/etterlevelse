import {
  EObjectType,
  IAuditItem,
  IAuditLog,
  IMailLog,
} from '@/constants/admin/audit/auditConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import moment from 'moment'

export const getAuditLog = async (id: string) => {
  const auditLog = (await axios.get<IAuditLog>(`${env.backendBaseUrl}/audit/log/${id}`)).data
  auditLog.audits.sort((a, b) => moment(b.time).valueOf() - moment(a.time).valueOf())
  return auditLog
}

export const getAudits = async (page: number, count: number, table?: EObjectType) => {
  return (
    await axios.get<IPageResponse<IAuditItem>>(
      `${env.backendBaseUrl}/audit?pageNumber=${page}&pageSize=${count}` +
        (table ? `&table=${table}` : '')
    )
  ).data
}

export const getAuditsByTableId = async (page: number, count: number, tableId: string) => {
  return (
    await axios.get<IPageResponse<IAuditItem>>(
      `${env.backendBaseUrl}/audit/tableid/${tableId}?pageNumber=${page}&pageSize=${count}`
    )
  ).data
}

export const getMailLog = async (start: number, count: number) => {
  return (
    await axios.get<IPageResponse<IMailLog>>(
      `${env.backendBaseUrl}/audit/maillog?pageNumber=${start}&pageSize=${count}`
    )
  ).data
}

export const getAuditByTableIdAndTimeStamp = async (tableId: string, timestamp: string) => {
  return (await axios.get<IAuditItem[]>(`${env.backendBaseUrl}/audit/log/${tableId}/${timestamp}`))
    .data
}
