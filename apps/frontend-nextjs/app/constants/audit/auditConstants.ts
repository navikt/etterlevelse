import { EObjectType } from '../admin/audit/auditConstants'
import { EListName } from '../kodeverk/kodeverkConstants'

export enum EAuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export type TNavigableItem =
  | EObjectType
  | EListName.RELEVANS
  | EListName.UNDERAVDELING
  | EListName.TEMA
  | EListName.LOV

export interface IAuditItem {
  action: EAuditAction
  id: string
  table: EObjectType
  tableId: string
  time: string
  user: string
  data: object
}
export interface IAuditLog {
  id: string
  audits: IAuditItem[]
}
