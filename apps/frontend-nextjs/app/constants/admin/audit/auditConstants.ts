import { EListName } from '@/constants/kodeverk/kodeverkConstants'

export enum EObjectType {
  Codelist = 'CODELIST',
  KravPriorityList = 'KravPriorityList',
  ETTERLEVELSE = 'ETTERLEVELSE',
  KRAV = 'KRAV',
  Melding = 'Melding',
  ETTERLEVELSE_METADATA = 'ETTERLEVELSE_METADATA',
  ETTERLEVELSE_DOKUMENTASJON = 'ETTERLEVELSE_DOKUMENTASJON',
  PVK_DOKUMENT = 'PVK_DOKUMENT',
  PVO_TILBAKEMELDING = 'PVO_TILBAKEMELDING',
  BEHANDLINGENS_LIVSLOP = 'BEHANDLINGENS_LIVSLOP',
  RISIKOSCENARIO = 'RISIKOSCENARIO',
  TILTAK = 'TILTAK',
  P360_ARCHIVE_DOCUMENT = 'P360_ARCHIVE_DOCUMENT',
  Krav = 'Krav',
  Etterlevelse = 'Etterlevelse',
  EtterlevelseMetadata = 'EtterlevelseMetadata',
  Behandling = 'Behandling',
  EtterlevelseDokumentasjon = 'EtterlevelseDokumentasjon',
  BehandlingData = 'BehandlingData',
  EtterlevelseArkiv = 'EtterlevelseArkiv',
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
export interface IMailLog {
  time: string
  to: string
  subject: string
  body: string
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
