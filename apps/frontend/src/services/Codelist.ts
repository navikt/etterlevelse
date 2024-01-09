import { AxiosResponse } from 'axios'
import { getAllCodelists } from '../api/CodelistApi'
import * as yup from 'yup'
import { Replace } from '../constants'

export enum ListName {
  AVDELING = 'AVDELING',
  UNDERAVDELING = 'UNDERAVDELING',
  RELEVANS = 'RELEVANS',
  LOV = 'LOV',
  TEMA = 'TEMA',
  VIRKEMIDDELTYPE = 'VIRKEMIDDELTYPE',
}

export enum LovCodeRelevans {
  KRAV_OG_VIRKEMIDDEL = 'KRAV_OG_VIRKEMIDDEL',
  KRAV = 'KRAV',
  VIRKEMIDDEL = 'VIRKEMIDDEL',
}

const LOVDATA_FORSKRIFT_PREFIX = 'FORSKRIFT_'

class CodelistService {
  lists?: IAllCodelists
  error?: string
  promise: Promise<any>

  constructor() {
    this.promise = this.fetchData()
  }

  private fetchData = async (refresh?: boolean) => {
    const codeListPromise = getAllCodelists(refresh)
      .then(this.handleGetCodelistResponse)
      .catch((err) => (this.error = err.message))
    return Promise.all([codeListPromise])
  }

  handleGetCodelistResponse = (response: AxiosResponse<IAllCodelists>) => {
    if (typeof response.data === 'object' && response.data !== null) {
      this.lists = response.data
    } else {
      this.error = response.data
    }
  }

  refreshCodeLists() {
    this.promise = this.fetchData(true)
    return this.promise
  }

  async wait() {
    await this.promise
  }

  isLoaded() {
    return this.lists || this.error
  }

  // overloads
  getCodes(list: ListName.LOV): LovCode[]
  getCodes(list: ListName.TEMA): TemaCode[]
  getCodes(list: ListName): ICode[]

  getCodes(list: ListName): ICode[] {
    return this.lists && this.lists.codelist[list] ? this.lists.codelist[list].sort((c1, c2) => c1.shortName.localeCompare(c2.shortName)) : []
  }

  // overloads
  getCode(list: ListName.LOV, codeName?: string): LovCode | undefined
  getCode(list: ListName.TEMA, codeName?: string): TemaCode | undefined
  getCode(list: ListName, codeName?: string): ICode | undefined

  getCode(list: ListName, codeName?: string): ICode | undefined {
    return this.getCodes(list).find((c) => c.code === codeName)
  }

  getCodesForTema(codeName?: string): LovCode[] {
    return this.getCodes(ListName.LOV).filter((c) => c.data?.tema === codeName)
  }

  valid(list: ListName, codeName?: string): boolean {
    return !!codeName && !!this.getCode(list, codeName)
  }

  getShortnameForCode(code: ICode) {
    return this.getShortname(code.list, code.code)
  }

  getShortnameForCodes(codes: ICode[]) {
    return codes.map((c) => this.getShortname(c.list, c.code)).join(', ')
  }

  getShortname(list: ListName, codeName: string) {
    const code = this.getCode(list, codeName)
    return code ? code.shortName : codeName
  }

  getShortnames(list: ListName, codeNames: string[]) {
    return codeNames.map((codeName) => this.getShortname(list, codeName))
  }

  getDescription(list: ListName, codeName: string) {
    const code = this.getCode(list, codeName)
    return code ? code.description : codeName
  }

  getParsedOptions(listName: ListName): { value: string; label: string; description: string }[] {
    return this.getCodes(listName).map((code: ICode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getOptionsForCode(codes: ICode[]): { id: string; label: string; description: string }[] {
    return codes.map((code: ICode) => {
      return { id: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForLov(forVirkemiddel?: boolean): { value: string; label: string; description: string }[] {
    const lovList = this.getCodes(ListName.LOV)
    let filteredLovList = []

    if (forVirkemiddel) {
      filteredLovList = filterLovCodeListForRelevans(lovList, LovCodeRelevans.VIRKEMIDDEL)
    } else {
      filteredLovList = filterLovCodeListForRelevans(lovList, LovCodeRelevans.KRAV)
    }

    return filteredLovList.map((code: LovCode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForList(listName: ListName, selected: string[]): { id: string; label: string }[] {
    return selected.map((code) => ({ id: code, label: this.getShortname(listName, code) }))
  }

  getParsedOptionsFilterOutSelected(listName: ListName, currentSelected: string[]): { value: string; label: string }[] {
    const parsedOptions = this.getParsedOptions(listName)
    return !currentSelected ? parsedOptions : parsedOptions.filter((option) => (currentSelected.includes(option.value) ? null : option.value))
  }

  isForskrift(nationalLawCode?: string) {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_FORSKRIFT_PREFIX)
  }

  makeIdLabelForAllCodeLists() {
    return Object.keys(ListName).map((key) => ({ id: key, label: key }))
  }

  gjelderForLov(tema: TemaCode, lov: LovCode) {
    return !!this.getCodesForTema(tema.code).filter((l) => l.code === lov.code).length
  }
}

export const codelist = new CodelistService()

export interface IAllCodelists {
  codelist: IList
}

export interface IList {
  [name: string]: ICode[]
}

export type LovCode = Replace<ICode, { data?: ILovCodeData }>
export type TemaCode = Replace<ICode, { data?: ITemaCodeData }>

export interface ICode {
  list: ListName
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
  data?: any
}

export interface ICodeUsage {
  listName: ListName
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
  relevantFor?: LovCodeRelevans
}

export interface ITemaCodeData {
  image?: string
  shortDesciption?: string
}

const required = 'Påkrevd'
export const codeListSchema: yup.ObjectSchema<ICodeListFormValues> = yup.object({
  list: yup.string().required(required),
  code: yup.string().required(required),
  shortName: yup.string().required(required),
  description: yup.string().required(required),
  data: yup.object().shape({
    shortDesciption: yup.string().max(200, 'Kort beskrivelse må være mindre enn 200 tegn'),
  }),
})

export const codelistCompareField = (field: string) => {
  return (a: any, b: any) => codelistCompare((a[field] as ICode) || undefined, (b[field] as ICode) || undefined)
}

export const codelistsCompareField = <T>(ext: (o: T) => ICode[], exclude?: string) => {
  const getCode = (obj: any) => {
    return (ext(obj) || []).filter((c) => c.code !== exclude)[0] || undefined
  }
  return (a: any, b: any) => codelistCompare(getCode(a), getCode(b))
}

export const codelistCompare = (a?: ICode, b?: ICode) => {
  return (a?.shortName || '').localeCompare(b?.shortName || '')
}

export const lovCodeRelevansToText = (lovCodeRelevans: string) => {
  switch (lovCodeRelevans) {
    case LovCodeRelevans.KRAV_OG_VIRKEMIDDEL.toString():
      return 'Krav og virkemiddel'
    case LovCodeRelevans.KRAV.toString():
      return 'Krav'
    case LovCodeRelevans.VIRKEMIDDEL.toString():
      return 'Virkemiddel'
  }
}

export const lovCodeRelevansToOptions = () => {
  return Object.keys(LovCodeRelevans).map((key) => {
    return { id: key, label: lovCodeRelevansToText(key) }
  })
}

export const filterLovCodeListForRelevans = (codeList: LovCode[], relevantFor: LovCodeRelevans) => {
  return codeList.filter((code: LovCode) => {
    if (code.data) {
      //for old data
      if (!code.data.relevantFor) {
        return true
      } else if (code.data.relevantFor === LovCodeRelevans.KRAV_OG_VIRKEMIDDEL || code.data.relevantFor === relevantFor) {
        return true
      }
    }
    return false
  })
}
