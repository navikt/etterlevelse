import { TReplace } from '../commonConstants'

export enum EListName {
  AVDELING = 'AVDELING',
  UNDERAVDELING = 'UNDERAVDELING',
  RELEVANS = 'RELEVANS',
  LOV = 'LOV',
  TEMA = 'TEMA',
  YTTERLIGERE_EGENSKAPER = 'YTTERLIGERE_EGENSKAPER',
  PVO_VURDERING = 'PVO_VURDERING',
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
export type TTemaCode = TReplace<ICode, { data?: ITemaCodeData }>

export interface ILovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
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

export interface IRegelverk {
  lov: TLovCode
  spesifisering?: string
}
