import { getAllCodelists } from '@/api/kodeverk/kodeverkApi'
import {
  EListName,
  IAllCodelists,
  ICode,
  ICodeListFormValues,
  TLovCode,
} from '@/constants/kodeverk/kodeverkConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { AxiosResponse } from 'axios'
import * as yup from 'yup'

const LOVDATA_FORSKRIFT_PREFIX = 'FORSKRIFT_'

const LOVDATA_RUNDSKRIV_PREFIX = 'RUNDSKRIV_'

export interface IGetParsedOptionsProps {
  value: string
  label: string
  description: string
}

interface IGetOptionsForCodeProps {
  id: string
  label: string
  description: string
}

interface IGetParsedOptionsForLovProps {
  value: string
  label: string
  description: string
}

interface IGetParsedOptionsForListProps {
  id: string
  label: string
}

interface IGetParsedOptionsFilterOutSelectedProps {
  value: string
  label: string
}

interface IMakeValueLabelForAllCodeListsProps {
  value: string
  label: string
}

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

  getLovCodesForTema(codeName?: string): TLovCode[] {
    return this.getCodes(EListName.LOV).filter((c) => c.data?.tema === codeName)
  }

  valid(list: EListName, codeName?: string): boolean {
    return !!codeName && !!this.getCode(list, codeName)
  }

  getShortnameForCode(code: ICode): string {
    return this.getShortname(code.list, code.code)
  }

  getShortnameForCodes(codes: ICode[]): string {
    return codes.map((code: ICode) => this.getShortname(code.list, code.code)).join(', ')
  }

  getShortname(list: EListName, codeName: string): string {
    const code = this.getCode(list, codeName)
    return code ? code.shortName : codeName
  }

  getShortnames(list: EListName, codeNames: string[]): string[] {
    return codeNames.map((codeName) => this.getShortname(list, codeName))
  }

  getDescription(list: EListName, codeName: string): string {
    const code = this.getCode(list, codeName)
    return code ? code.description : codeName
  }

  isForskrift(nationalLawCode?: string): boolean | '' | undefined {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_FORSKRIFT_PREFIX)
  }

  isRundskriv(nationalLawCode?: string): boolean | '' | undefined {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_RUNDSKRIV_PREFIX)
  }

  getParsedOptions(listName: EListName): IGetParsedOptionsProps[] {
    return this.getCodes(listName).map((code: ICode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getOptionsForCode(codes: ICode[]): IGetOptionsForCodeProps[] {
    return codes.map((code: ICode) => {
      return { id: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForLov(): IGetParsedOptionsForLovProps[] {
    const lovList = this.getCodes(EListName.LOV)
    return lovList.map((code: TLovCode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  getParsedOptionsForList(
    listName: EListName,
    selected: string[]
  ): IGetParsedOptionsForListProps[] {
    return selected.map((code) => ({ id: code, label: this.getShortname(listName, code) }))
  }

  getParsedOptionsFilterOutSelected(
    listName: EListName,
    currentSelected: string[]
  ): IGetParsedOptionsFilterOutSelectedProps[] {
    const parsedOptions = this.getParsedOptions(listName)
    return !currentSelected
      ? parsedOptions
      : parsedOptions.filter((option) =>
          currentSelected.includes(option.value) ? null : option.value
        )
  }

  makeValueLabelForAllCodeLists(): IMakeValueLabelForAllCodeListsProps[] {
    return Object.keys(EListName).map((key) => ({ value: key, label: key }))
  }

  gjelderForLov(tema: TTemaCode, lov: TLovCode) {
    return !!this.getLovCodesForTema(tema.code).filter((l) => l.code === lov.code).length
  }
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
  code: yup
    .string()
    .matches(/^[A-Z_]+$/, 'Der er ikke tilatt med små bokstaver, mellomrom, æ, ø og å i code.')
    .required(required),
  shortName: yup.string().required(required),
  description: yup.string().required(required),
  data: yup.object().shape({
    shortDesciption: yup.string().max(200, 'Kort beskrivelse må være mindre enn 200 tegn'),
    lovId: lovCodeListDataCheck('lovIdCheck'),
    underavdeling: lovCodeListDataCheck('underavdelingCheck'),
    tema: lovCodeListDataCheck('temaCheck'),
  }),
})

export const codelist = new CodelistService()
