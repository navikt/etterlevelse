import { TReplace } from '../constant'

export enum EListName {
  AVDELING = 'AVDELING',
  UNDERAVDELING = 'UNDERAVDELING',
  RELEVANS = 'RELEVANS',
  LOV = 'LOV',
  TEMA = 'TEMA',
  VIRKEMIDDELTYPE = 'VIRKEMIDDELTYPE',
  YTTERLIGERE_EGENSKAPER = 'YTTERLIGERE_EGENSKAPER',
  PVO_VURDERING = 'PVO_VURDERING',
}

export enum ELovCodeRelevans {
  KRAV_OG_VIRKEMIDDEL = 'KRAV_OG_VIRKEMIDDEL',
  KRAV = 'KRAV',
  VIRKEMIDDEL = 'VIRKEMIDDEL',
}

export interface ICode {
  list: EListName
  code: string
  shortName: string
  description: string
  data: any
  invalidCode?: boolean
}

export type TLovCode = TReplace<ICode, { data?: ILovCodeData }>

export interface ILovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
  relevantFor?: ELovCodeRelevans
}
