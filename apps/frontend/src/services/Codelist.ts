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
}

const LOVDATA_FORSKRIFT_PREFIX = 'FORSKRIFT_'

class CodelistService {
  lists?: AllCodelists
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

  handleGetCodelistResponse = (response: AxiosResponse<AllCodelists>) => {
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
  getCodes(list: ListName): Code[]

  getCodes(list: ListName): Code[] {
    return this.lists && this.lists.codelist[list] ? this.lists.codelist[list].sort((c1, c2) => c1.shortName.localeCompare(c2.shortName)) : []
  }

  // overloads
  getCode(list: ListName.LOV, codeName?: string): LovCode | undefined
  getCode(list: ListName.TEMA, codeName?: string): TemaCode | undefined
  getCode(list: ListName, codeName?: string): Code | undefined

  getCode(list: ListName, codeName?: string): Code | undefined {
    return this.getCodes(list).find((c) => c.code === codeName)
  }

  getCodesForTema(codeName?: string): LovCode[] {
    return this.getCodes(ListName.LOV).filter((c) => c.data?.tema === codeName)
  }

  valid(list: ListName, codeName?: string): boolean {
    return !!codeName && !!this.getCode(list, codeName)
  }

  getShortnameForCode(code: Code) {
    return this.getShortname(code.list, code.code)
  }

  getShortnameForCodes(codes: Code[]) {
    return codes.map((c) => this.getShortname(c.list, c.code)).join(', ')
  }

  getShortname(list: ListName, codeName: string) {
    let code = this.getCode(list, codeName)
    return code ? code.shortName : codeName
  }

  getShortnames(list: ListName, codeNames: string[]) {
    return codeNames.map((codeName) => this.getShortname(list, codeName))
  }

  getDescription(list: ListName, codeName: string) {
    let code = this.getCode(list, codeName)
    return code ? code.description : codeName
  }

  getParsedOptions(listName: ListName): { id: string; label: string, description: string }[] {
    return this.getCodes(listName).map((code: Code) => {
      return { id: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForList(listName: ListName, selected: string[]): { id: string; label: string }[] {
    return selected.map((code) => ({ id: code, label: this.getShortname(listName, code) }))
  }

  getParsedOptionsFilterOutSelected(listName: ListName, currentSelected: string[]): { id: string; label: string }[] {
    let parsedOptions = this.getParsedOptions(listName)
    return !currentSelected ? parsedOptions : parsedOptions.filter((option) => (currentSelected.includes(option.id) ? null : option.id))
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

export interface AllCodelists {
  codelist: List
}

export interface List {
  [name: string]: Code[]
}

export type LovCode = Replace<Code, { data?: LovCodeData }>
export type TemaCode = Replace<Code, { data?: TemaCodeData }>

export interface Code {
  list: ListName
  code: string
  shortName: string
  description: string
  data: any
  invalidCode?: boolean
}

export interface CodeListFormValues {
  list: string
  code: string
  shortName?: string
  description?: string
  data?: any
}

export interface CodeUsage {
  listName: ListName
  code: string
  inUse: boolean
  krav: [Use]
  behandlinger: [Use]
  codelist: [Code]
}

export interface Use {
  id: string
  name: string
}

export interface CategoryUsage {
  listName: string
  codesInUse: CodeUsage[]
}

export interface LovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
}

export interface TemaCodeData {
  image?: string
  shortDesciption?: string
}

const required = 'Påkrevd'
export const codeListSchema: () => yup.SchemaOf<CodeListFormValues> = () =>
  yup.object({
    list: yup.mixed().required(required),
    code: yup.string().required(required),
    shortName: yup.string().required(required),
    description: yup.string().required(required),
    data: yup.object().shape({
      shortDesciption: yup.string().max(200, 'Kort beskrivelse må være mindre enn 200 tegn'),
    }),
  })

export const codelistCompareField = (field: string) => {
  return (a: any, b: any) => codelistCompare((a[field] as Code) || undefined, (b[field] as Code) || undefined)
}

export const codelistsCompareField = <T>(ext: (o: T) => Code[], exclude?: string) => {
  const getCode = (obj: any) => {
    return (ext(obj) || []).filter((c) => c.code !== exclude)[0] || undefined
  }
  return (a: any, b: any) => codelistCompare(getCode(a), getCode(b))
}

export const codelistCompare = (a?: Code, b?: Code) => {
  return (a?.shortName || '').localeCompare(b?.shortName || '')
}
