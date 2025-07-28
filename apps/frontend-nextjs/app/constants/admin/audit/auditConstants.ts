import { EListName } from '@/constants/kodeverk/kodeverkConstants'

export enum EObjectType {
  Codelist = 'CODELIST',
  Krav = 'Krav',
  KravPriorityList = 'KravPriorityList',
  Etterlevelse = 'Etterlevelse',
  Behandling = 'Behandling',
  EtterlevelseDokumentasjon = 'EtterlevelseDokumentasjon',
  BehandlingData = 'BehandlingData',
  Melding = 'Melding',
  EtterlevelseArkiv = 'EtterlevelseArkiv',
  EtterlevelseMetadata = 'EtterlevelseMetadata',
}

export interface IAuditLog {
  id: string
  audits: IAuditItem[]
}

export interface IAuditItem {
  action: EAuditAction
  id: string
  table: EObjectType
  tableId: string
  time: string
  user: string
  data: object
}

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
