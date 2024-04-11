import { AxiosResponse } from 'axios'
import * as yup from 'yup'
import { getAllCodelists } from '../api/CodelistApi'
import { TReplace } from '../constants'

export enum EListName {
  AVDELING = 'AVDELING',
  UNDERAVDELING = 'UNDERAVDELING',
  RELEVANS = 'RELEVANS',
  LOV = 'LOV',
  TEMA = 'TEMA',
  VIRKEMIDDELTYPE = 'VIRKEMIDDELTYPE',
}

export enum ELovCodeRelevans {
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
  getCodes(list: EListName.LOV): TLovCode[]
  getCodes(list: EListName.TEMA): TTemaCode[]
  getCodes(list: EListName): ICode[]

  getCodes(list: EListName): ICode[] {
    return this.lists && this.lists.codelist[list]
      ? this.lists.codelist[list].sort((c1, c2) => c1.shortName.localeCompare(c2.shortName, 'nb'))
      : []
  }

  // overloads
  getCode(list: EListName.LOV, codeName?: string): TLovCode | undefined
  getCode(list: EListName.TEMA, codeName?: string): TTemaCode | undefined
  getCode(list: EListName, codeName?: string): ICode | undefined

  getCode(list: EListName, codeName?: string): ICode | undefined {
    return this.getCodes(list).find((c) => c.code === codeName)
  }

  getCodesForTema(codeName?: string): TLovCode[] {
    return this.getCodes(EListName.LOV).filter((c) => c.data?.tema === codeName)
  }

  valid(list: EListName, codeName?: string): boolean {
    return !!codeName && !!this.getCode(list, codeName)
  }

  getShortnameForCode(code: ICode) {
    return this.getShortname(code.list, code.code)
  }

  getShortnameForCodes(codes: ICode[]) {
    return codes.map((code) => this.getShortname(code.list, code.code)).join(', ')
  }

  getShortname(list: EListName, codeName: string) {
    const code = this.getCode(list, codeName)
    return code ? code.shortName : codeName
  }

  getShortnames(list: EListName, codeNames: string[]) {
    return codeNames.map((codeName) => this.getShortname(list, codeName))
  }

  getDescription(list: EListName, codeName: string) {
    const code = this.getCode(list, codeName)
    return code ? code.description : codeName
  }

  getParsedOptions(listName: EListName): { value: string; label: string; description: string }[] {
    return this.getCodes(listName).map((code: ICode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getOptionsForCode(codes: ICode[]): { id: string; label: string; description: string }[] {
    return codes.map((code: ICode) => {
      return { id: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForLov(
    forVirkemiddel?: boolean
  ): { value: string; label: string; description: string }[] {
    const lovList = this.getCodes(EListName.LOV)
    let filteredLovList = []

    if (forVirkemiddel) {
      filteredLovList = filterLovCodeListForRelevans(lovList, ELovCodeRelevans.VIRKEMIDDEL)
    } else {
      filteredLovList = filterLovCodeListForRelevans(lovList, ELovCodeRelevans.KRAV)
    }

    return filteredLovList.map((code: TLovCode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForList(
    listName: EListName,
    selected: string[]
  ): { id: string; label: string }[] {
    return selected.map((code) => ({ id: code, label: this.getShortname(listName, code) }))
  }

  getParsedOptionsFilterOutSelected(
    listName: EListName,
    currentSelected: string[]
  ): { value: string; label: string }[] {
    const parsedOptions = this.getParsedOptions(listName)
    return !currentSelected
      ? parsedOptions
      : parsedOptions.filter((option) =>
          currentSelected.includes(option.value) ? null : option.value
        )
  }

  isForskrift(nationalLawCode?: string) {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_FORSKRIFT_PREFIX)
  }

  makeValueLabelForAllCodeLists() {
    return Object.keys(EListName).map((key) => ({ value: key, label: key }))
  }

  gjelderForLov(tema: TTemaCode, lov: TLovCode) {
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

export type TLovCode = TReplace<ICode, { data?: ILovCodeData }>
export type TTemaCode = TReplace<ICode, { data?: ITemaCodeData }>

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

const containsLovCodeDataCheck = (data?: string, list?: string): boolean => {
  if (list === EListName.LOV) {
    return data ? true : false
  }
  return true
}

const required = 'Påkrevd'

const lovCodeListDataCheck = (testName: string) =>
  yup.string().test({
    name: testName,
    message: required,
    test: function (data) {
      const { options } = this
      return containsLovCodeDataCheck(data, options.context?.list)
    },
  })

export const codeListSchema: yup.ObjectSchema<ICodeListFormValues> = yup.object({
  list: yup.string().required(required),
  code: yup.string().required(required),
  shortName: yup.string().required(required),
  description: yup.string().required(required),
  data: yup.object().shape({
    shortDesciption: yup.string().max(200, 'Kort beskrivelse må være mindre enn 200 tegn'),
    lovId: lovCodeListDataCheck('lovIdCheck'),
    underavdeling: lovCodeListDataCheck('underavdelingCheck'),
    tema: lovCodeListDataCheck('temaCheck'),
  }),
})

export const lovCodeRelevansToText = (lovCodeRelevans: string) => {
  switch (lovCodeRelevans) {
    case ELovCodeRelevans.KRAV_OG_VIRKEMIDDEL.toString():
      return 'Krav og virkemiddel'
    case ELovCodeRelevans.KRAV.toString():
      return 'Krav'
    case ELovCodeRelevans.VIRKEMIDDEL.toString():
      return 'Virkemiddel'
  }
}

export const lovCodeRelevansToOptions = () => {
  return Object.keys(ELovCodeRelevans).map((key) => {
    return { value: key, label: lovCodeRelevansToText(key) }
  })
}

export const filterLovCodeListForRelevans = (
  codeList: TLovCode[],
  relevantFor: ELovCodeRelevans
) => {
  return codeList.filter((code: TLovCode) => {
    if (code.data) {
      //for old data
      if (!code.data.relevantFor) {
        return true
      } else if (
        code.data.relevantFor === ELovCodeRelevans.KRAV_OG_VIRKEMIDDEL ||
        code.data.relevantFor === relevantFor
      ) {
        return true
      }
    }
    return false
  })
}
