import { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { getAllCodelists } from '../api/CodelistApi'
import { TReplace } from '../constants'

/* eslint-disable */
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

export interface ICodelistProps {
  fetchData: (refresh?: boolean) => Promise<any>
  isLoaded: () => string | IAllCodelists | undefined
  getCodes: (list: EListName) => TLovCode[] | TTemaCode[] | ICode[]
  getCode: (list: EListName, codeName?: string) => TLovCode | TTemaCode | ICode | undefined
  valid: (list: EListName, codeName?: string) => boolean
  getCodesForTema: (codeName?: string) => TLovCode[]
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
  makeValueLabelForAllCodeLists: () => { value: string; label: string }[]
  gjelderForLov: (tema: TTemaCode, lov: TLovCode) => boolean
}

interface IGetParsedOptionsProps {
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

export const CodelistService = () => {
  const [lists, setLists] = useState<IAllCodelists | undefined>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    ;(async () => {
      await fetchData()
    })()
  }, [])

  const fetchData = async (refresh?: boolean): Promise<any> => {
    if (lists === undefined || refresh) {
      getAllCodelists(refresh)
        .then(handleGetCodelistResponse)
        .catch((error: any) => (error = error.message))
    }
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
    const newList: TLovCode[] | TTemaCode[] | ICode[] =
      lists && lists.codelist[list]
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

  const getCodesForTema = (codeName?: string): TLovCode[] => {
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

  const getParsedOptionsForLov = (forVirkemiddel?: boolean): IGetParsedOptionsForLovProps[] => {
    const lovList: TLovCode[] = getCodes(EListName.LOV) as TLovCode[]
    let filteredLovList: TLovCode[] = []

    if (forVirkemiddel) {
      filteredLovList = filterLovCodeListForRelevans(lovList, ELovCodeRelevans.VIRKEMIDDEL)
    } else {
      filteredLovList = filterLovCodeListForRelevans(lovList, ELovCodeRelevans.KRAV)
    }

    return filteredLovList.map((code: TLovCode) => {
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

  const makeValueLabelForAllCodeLists = (): IMakeValueLabelForAllCodeListsProps[] => {
    return Object.keys(EListName).map((key: string) => ({ value: key, label: key }))
  }

  const gjelderForLov = (tema: TTemaCode, lov: TLovCode): boolean => {
    return !!getCodesForTema(tema.code).filter((code: TLovCode) => code.code === lov.code).length
  }

  const utils: ICodelistProps = {
    fetchData,
    isLoaded,
    getCodes,
    getCode,
    getCodesForTema,
    valid,
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
    makeValueLabelForAllCodeLists,
    gjelderForLov,
  }

  return [utils, lists] as [ICodelistProps, IAllCodelists | undefined]
}

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

interface ILovCodeRelevansToOptionsProps {
  value: string
  label: string | undefined
}

export const lovCodeRelevansToOptions = (): ILovCodeRelevansToOptionsProps[] => {
  return Object.keys(ELovCodeRelevans).map((key: string) => {
    return { value: key, label: lovCodeRelevansToText(key) }
  })
}

export const filterLovCodeListForRelevans = (
  codeList: TLovCode[],
  relevantFor: ELovCodeRelevans
): TLovCode[] => {
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
