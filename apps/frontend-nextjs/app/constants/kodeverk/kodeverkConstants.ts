import { TReplace } from '../commonConstants'
import { ITemaCodeData } from '../teamkatalogen/teamkatalogConstants'

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

interface IList {
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

interface IUse {
  id: string
  name: string
  number: string
}

export interface IRegelverk {
  lov: TLovCode
  spesifisering?: string
}

export interface ICodeListFormValues {
  list: string
  code: string
  shortName?: string
  description?: string
  data?: ILovCodeData | ITemaCodeData
}

export interface ILovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
}

export interface IGetParsedOptionsProps {
  value: string
  label: string
  description: string
}

export interface IGetOptionsForCodeProps {
  id: string
  label: string
  description: string
}

export interface IGetParsedOptionsForLovProps {
  value: string
  label: string
  description: string
}

export interface IGetParsedOptionsForListProps {
  id: string
  label: string
}

export interface IGetParsedOptionsFilterOutSelectedProps {
  value: string
  label: string
}

export interface IMakeValueLabelForAllCodeListsProps {
  value: string
  label: string
}
