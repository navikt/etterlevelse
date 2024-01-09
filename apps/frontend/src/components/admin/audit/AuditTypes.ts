import { ListName } from '../../../services/Codelist'

export interface IAuditItem {
  action: AuditAction
  id: string
  table: ObjectType
  tableId: string
  time: string
  user: string
  data: object
}

export interface IAuditLog {
  id: string
  audits: IAuditItem[]
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ObjectType {
  Codelist = 'CODELIST',
  Krav = 'Krav',
  Etterlevelse = 'Etterlevelse',
  Behandling = 'Behandling',
  EtterlevelseDokumentasjon = 'EtterlevelseDokumentasjon',
  BehandlingData = 'BehandlingData',
  Melding = 'Melding',
  EtterlevelseArkiv = 'EtterlevelseArkiv',
  EtterlevelseMetadata = 'EtterlevelseMetadata',
}

export type NavigableItem = ObjectType | ListName.RELEVANS | ListName.UNDERAVDELING | ListName.TEMA | ListName.LOV
