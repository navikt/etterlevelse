'use client'

import { getAllCodelists } from '@/api/kodeverk/kodeverkApi'
import { IAllCodelists, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { AxiosResponse } from 'axios'
import { FunctionComponent, createContext, useEffect, useState } from 'react'
import * as yup from 'yup'

export enum EListName {
  AVDELING = 'AVDELING',
  UNDERAVDELING = 'UNDERAVDELING',
  RELEVANS = 'RELEVANS',
  LOV = 'LOV',
  TEMA = 'TEMA',
  YTTERLIGERE_EGENSKAPER = 'YTTERLIGERE_EGENSKAPER',
  PVO_VURDERING = 'PVO_VURDERING',
}

const LOVDATA_FORSKRIFT_PREFIX = 'FORSKRIFT_'

const LOVDATA_RUNDSKRIV_PREFIX = 'RUNDSKRIV_'

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
  getParsedOptionsForLov: () => { value: string; label: string; description: string }[]
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

export const CodelistContext = createContext<{ utils: ICodelistProps; lists: IAllCodelists }>({
  utils: {
    fetchData: async () => {},
    isLoaded: () => '',
    getCodes: () => [],
    getCode: () => {
      return {} as ICode
    },
    valid: () => false,
    getLovCodesForTema: () => [],
    getShortnameForCode: () => '',
    getShortnameForCodes: () => '',
    getShortname: () => '',
    getShortnames: () => [],
    getDescription: () => '',
    getParsedOptions: () => [],
    getOptionsForCode: () => [],
    getParsedOptionsForLov: () => [],
    getParsedOptionsForList: () => [],
    getParsedOptionsFilterOutSelected: () => [],
    isForskrift: () => false,
    isRundskriv: () => false,
    makeValueLabelForAllCodeLists: () => [],
    gjelderForLov: () => false,
  },
  lists: {} as IAllCodelists,
})

type TProps = {
  children: React.ReactNode
}

export const CodelistProvider: FunctionComponent<TProps> = ({ children }) => {
  const [lists, setLists] = useState<IAllCodelists>({ codelist: {} } as IAllCodelists)
  const [error, setError] = useState<string | undefined>(undefined)

  const fetchData = async (refresh?: boolean) => {
    const codeListPromise = getAllCodelists(refresh)
      .then(handleGetCodelistResponse)
      .catch((err) => setError(err.message))
    return Promise.all([codeListPromise])
  }

  const handleGetCodelistResponse = (response: AxiosResponse<IAllCodelists>) => {
    if (typeof response.data === 'object' && response.data !== null) {
      setLists(response.data)
    } else {
      setError(response.data)
    }
  }

  const isLoaded = (): string | IAllCodelists | undefined => {
    return lists || error
  }

  // overloads
  // getCodes(list: EListName.LOV): TLovCode[]
  // getCodes(list: EListName.TEMA): TTemaCode[]
  // getCodes(list: EListName): ICode[]¨

  const getCodes = (list: EListName): TLovCode[] | TTemaCode[] | ICode[] => {
    console.debug(lists)
    const newList: TLovCode[] | TTemaCode[] | ICode[] =
      lists && lists.codelist && lists.codelist[list]
        ? lists.codelist[list].sort((c1: ICode, c2: ICode) =>
            c1.shortName.localeCompare(c2.shortName, 'nb')
          )
        : []

    if (list === EListName.LOV) {
      return newList as TLovCode[]
    }

    if (list === EListName.TEMA) {
      return newList as TTemaCode[]
    }

    return newList as ICode[]
  }

  // overloads
  //  getCode(list: EListName.LOV, codeName?: string): TLovCode | undefined
  //  getCode(list: EListName.TEMA, codeName?: string): TTemaCode | undefined
  //  getCode(list: EListName, codeName?: string): ICode | undefined

  const getCode = (
    list: EListName,
    codeName?: string
  ): TLovCode | TTemaCode | ICode | undefined => {
    const code: ICode | TLovCode | TTemaCode | undefined = getCodes(list).find(
      (getCode) => getCode.code === codeName
    )

    if (list === EListName.LOV) {
      return code as TLovCode | undefined
    }

    if (list === EListName.TEMA) {
      return code as TTemaCode | undefined
    }

    return code as ICode | undefined
  }

  const getLovCodesForTema = (codeName?: string): TLovCode[] => {
    return getCodes(EListName.LOV).filter((code) => code.data?.tema === codeName) as TLovCode[]
  }

  const valid = (list: EListName, codeName?: string): boolean => {
    return !!codeName && !!getCode(list, codeName)
  }

  const getShortnameForCode = (code: ICode): string => {
    return getShortname(code.list, code.code)
  }

  const getShortnameForCodes = (codes: ICode[]): string => {
    return codes.map((code: ICode) => getShortname(code.list, code.code)).join(', ')
  }

  const getShortname = (list: EListName, codeName: string): string => {
    const code: ICode | TLovCode | TTemaCode | undefined = getCode(list, codeName)
    return code ? code.shortName : codeName
  }

  const getShortnames = (list: EListName, codeNames: string[]): string[] => {
    return codeNames.map((codeName: string) => getShortname(list, codeName))
  }

  const getDescription = (list: EListName, codeName: string): string => {
    const code: ICode | TLovCode | TTemaCode | undefined = getCode(list, codeName)
    return code ? code.description : codeName
  }

  const getParsedOptions = (listName: EListName): IGetParsedOptionsProps[] => {
    return getCodes(listName).map((code: ICode | TLovCode | TTemaCode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  const getOptionsForCode = (codes: ICode[]): IGetOptionsForCodeProps[] => {
    return codes.map((code: ICode) => {
      return { id: code.code, label: code.shortName, description: code.description }
    })
  }

  const getParsedOptionsForLov = (): IGetParsedOptionsForLovProps[] => {
    const lovList: TLovCode[] = getCodes(EListName.LOV) as TLovCode[]
    return lovList.map((code: TLovCode) => {
      return { value: code.code, label: code.shortName, description: code.description }
    })
  }

  const getParsedOptionsForList = (
    listName: EListName,
    selected: string[]
  ): IGetParsedOptionsForListProps[] => {
    return selected.map((code: string) => ({ id: code, label: getShortname(listName, code) }))
  }

  const getParsedOptionsFilterOutSelected = (
    listName: EListName,
    currentSelected: string[]
  ): IGetParsedOptionsFilterOutSelectedProps[] => {
    const parsedOptions = getParsedOptions(listName)
    return !currentSelected
      ? parsedOptions
      : parsedOptions.filter((option) =>
          currentSelected.includes(option.value) ? null : option.value
        )
  }

  const isForskrift = (nationalLawCode?: string): boolean | '' | undefined => {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_FORSKRIFT_PREFIX)
  }

  const isRundskriv = (nationalLawCode?: string): boolean | '' | undefined => {
    return nationalLawCode && nationalLawCode.startsWith(LOVDATA_RUNDSKRIV_PREFIX)
  }

  const makeValueLabelForAllCodeLists = (): IMakeValueLabelForAllCodeListsProps[] => {
    return Object.keys(EListName).map((key: string) => ({ value: key, label: key }))
  }

  const gjelderForLov = (tema: TTemaCode, lov: TLovCode): boolean => {
    return !!getLovCodesForTema(tema.code).filter((code: TLovCode) => code.code === lov.code).length
  }

  useEffect(() => {
    ;(async () => await fetchData())()
  }, [])

  return (
    <CodelistContext.Provider
      value={{
        utils: {
          fetchData,
          isLoaded,
          getCodes,
          getCode,
          valid,
          getLovCodesForTema,
          getShortnameForCode,
          getShortnameForCodes,
          getShortname,
          getShortnames,
          getDescription,
          getParsedOptions,
          getOptionsForCode,
          getParsedOptionsForLov,
          getParsedOptionsForList,
          getParsedOptionsFilterOutSelected,
          isForskrift,
          isRundskriv,
          makeValueLabelForAllCodeLists,
          gjelderForLov,
        },
        lists: lists,
      }}
    >
      {children}
    </CodelistContext.Provider>
  )
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

export interface ILovCodeData {
  lovId?: string
  underavdeling?: string
  tema?: string
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
