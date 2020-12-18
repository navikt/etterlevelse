import {ListName} from '../../../services/Codelist'

export interface AuditItem {
  action: AuditAction;
  id: string;
  table: ObjectType;
  tableId: string;
  time: string;
  user: string;
  data: object;
}

export interface AuditLog {
  id: string;
  audits: AuditItem[];
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

export enum ObjectType {
  Settings = "Settings",
  Krav = "Krav",
  Etterlevelse = "Etterlevelse"
}

export type NavigableItem = ObjectType |
  ListName.RELEVANS
