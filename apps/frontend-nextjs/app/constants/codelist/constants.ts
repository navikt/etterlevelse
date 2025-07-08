import { TReplace } from '@/constants/common/constants'

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

export interface ICodelistProps {
  fetchData: (refresh?: boolean) => Promise<any>
  isLoaded: () => string | IAllCodelists | undefined
  getCodes: (list: EListName) => TLovCode[] | TTemaCode[] | ICode[]
  getCode: (list: EListName, codeName?: string) => TLovCode | TTemaCode | ICode | undefined
  valid: (list: EListName, codeName?: string) => boolean
  getLovCodesForTema: (codeName?: string) => TLovCode[]
  getShortnameForCode: (code: ICode) => string
  getShortnameForCodes: (codes: ICode[]) => string
  getShortname: (list: EListName, codeName: string) => string
  getShortnames: (list: EListName, codeNames: string[]) => string[]
  getDescription: (list: EListName, codeName: string) => string
  getParsedOptions: (listName: EListName) => IGetParsedOptionsProps[]
  getOptionsForCode: (codes: ICode[]) => { id: string; label: string; description: string }[]
  getParsedOptionsForLov: (
    forVirkemiddel?: boolean
  ) => { value: string; label: string; description: string }[]
  getParsedOptionsForList: (
    listName: EListName,
    selected: string[]
  ) => { id: string; label: string }[]
  getParsedOptionsFilterOutSelected: (
    listName: EListName,
    currentSelected: string[]
  ) => { value: string; label: string }[]
  isForskrift: (nationalLawCode?: string) => boolean | '' | undefined
  isRundskriv: (nationalLawCode?: string) => boolean | '' | undefined
  makeValueLabelForAllCodeLists: () => { value: string; label: string }[]
  gjelderForLov: (tema: TTemaCode, lov: TLovCode) => boolean
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

export interface IAllCodelists {
  codelist: IList
}

export interface IList {
  [name: string]: ICode[]
}

export interface ICode {
  list: EListName
  code: string
  shortName: string
  description: string
  data: any
  invalidCode?: boolean
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

export interface ILovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
  relevantFor?: ELovCodeRelevans
}

export interface ITemaCodeData {
  image?: string
  shortDesciption?: string
}

export interface ILovCodeRelevansToOptionsProps {
  value: string
  label: string | undefined
}

export type TLovCode = TReplace<ICode, { data?: ILovCodeData }>
export type TTemaCode = TReplace<ICode, { data?: ITemaCodeData }>
