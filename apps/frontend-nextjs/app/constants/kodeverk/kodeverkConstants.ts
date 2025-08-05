import { TReplace } from '../commonConstants'

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

export interface IAllCodelists {
  codelist: IList
}

export interface IList {
  [name: string]: ICode[]
}

export interface ICodeListFormValues {
  list: string
  code: string
  shortName?: string
  description?: string
  data?: ILovCodeData | ITemaCodeData
}
export interface ICodeUsage {
  listName: EListName
  code: string
  inUse: boolean
  krav: [IUse]
  etterlevelseDokumentasjoner: [IUse]
  codelist: [ICode]
}

export interface IUse {
  id: string
  name: string
  number: string
}

export interface ICategoryUsage {
  listName: string
  codesInUse: ICodeUsage[]
}

export interface ITemaCodeData {
  image?: string
  shortDesciption?: string
}
