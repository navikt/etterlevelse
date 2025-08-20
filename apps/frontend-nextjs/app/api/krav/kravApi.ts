import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/kravConstants'
import { TSearchItem } from '@/constants/search/searchConstants'
import { env } from '@/util/env/env'
import { kravMap, kravName } from '@/util/krav/kravUtil'
import axios from 'axios'

export const getAllKrav = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKrav: IKrav[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKrav = [...allKrav, ...(await getKravPage(currentPage, PAGE_SIZE)).content]
    }
    return allKrav
  }
}

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IKrav>>(
      `${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const deleteKrav = async (id: string) => {
  return (await axios.delete<IKrav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

const searchKrav = async (name: string): Promise<IKrav[]> => {
  return (await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data
    .content
}

const searchKravByNumber = async (number: string) => {
  return (
    await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/number/${number}`)
  ).data.content
}

const getKravByKravNumberAndVersion = async (
  kravNummer: number | string,
  kravVersjon: number | string
): Promise<IKrav | undefined> => {
  return await axios
    .get<IKrav>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravByKravNummer = async (kravNummer: number | string) => {
  return (
    await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}`)
  ).data
}

export const createKrav = async (krav: TKravQL) => {
  const domainToObject = kravToKravDomainObject(krav)
  return (await axios.post<IKrav>(`${env.backendBaseUrl}/krav`, domainToObject)).data
}

export const updateKrav = async (krav: TKravQL) => {
  const domainToObject = kravToKravDomainObject(krav)
  return (await axios.put<IKrav>(`${env.backendBaseUrl}/krav/${krav.id}`, domainToObject)).data
}

function kravToKravDomainObject(krav: TKravQL): IKrav {
  const domainToObject = {
    ...krav,
    avdeling: krav.avdeling?.code,
    underavdeling: krav.underavdeling?.code,
    relevansFor: krav.relevansFor.map((relevans) => relevans.code),
    regelverk: krav.regelverk.map((regelverk) => ({ ...regelverk, lov: regelverk.lov.code })),
    begrepIder: krav.begreper.map((begrep) => begrep.id),
    kravIdRelasjoner: krav.kravRelasjoner.map((kravRelasjon) => kravRelasjon.id),
    varslingsadresser: krav.varslingsadresserQl.map((varslingsadresse) => {
      return {
        adresse: varslingsadresse.adresse,
        type: varslingsadresse.type,
      }
    }),
  } as any
  delete domainToObject.changeStamp
  delete domainToObject.version
  delete domainToObject.begreper
  delete domainToObject.kravRelasjoner
  return domainToObject
}

export const useSearchKrav = async (searchParams: string) => {
  if (searchParams && searchParams.length > 2) {
    if (searchParams.toLowerCase().match(/k\d{1,3}/)) {
      let kravNumber = searchParams
      if (kravNumber[0].toLowerCase() === 'k') {
        kravNumber = kravNumber.substring(1)
      }

      if (searchParams.length > 3) {
        if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
          const kravNummerMedVersjon = kravNumber.split('.')
          const kravRes = await getKravByKravNumberAndVersion(
            kravNummerMedVersjon[0],
            kravNummerMedVersjon[1]
          )
          if (kravRes && kravRes.status === EKravStatus.AKTIV) {
            return [
              {
                value: kravRes.id,
                label: 'K' + kravRes.kravNummer + '.' + kravRes.kravVersjon + ' ' + kravRes.navn,
                ...kravRes,
              },
            ]
          }
        } else {
          const kravRes = await searchKrav(kravNumber)
          return kravRes
            .filter((krav) => krav.status === EKravStatus.AKTIV)
            .map((krav) => {
              return {
                value: krav.id,
                label: 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn,
                ...krav,
              }
            })
        }
      }
    } else {
      const kravRes = await searchKrav(searchParams)
      return kravRes
        .filter((krav) => krav.status === EKravStatus.AKTIV)
        .map((krav) => {
          return {
            value: krav.kravId,
            label: 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn,
            ...krav,
          }
        })
    }
  }
  return []
}

export const kravMapToFormVal = (krav: Partial<TKravQL>): TKravQL => ({
  kravId: krav.kravId || '',
  navn: krav.navn || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  changeStamp: krav.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
  beskrivelse: krav.beskrivelse || '',
  utdypendeBeskrivelse: krav.utdypendeBeskrivelse || '',
  versjonEndringer: krav.versjonEndringer || '',
  dokumentasjon: krav.dokumentasjon || [],
  implementasjoner: krav.implementasjoner || '',
  begreper: krav.begreper || [],
  varslingsadresser: krav.varslingsadresser || [],
  varslingsadresserQl: krav.varslingsadresserQl || [],
  rettskilder: krav.rettskilder || [],
  tagger: krav.tagger || [],
  regelverk: krav.regelverk || [],
  hensikt: krav.hensikt || '',
  notat: krav.notat || '',
  varselMelding: krav.varselMelding || '',
  avdeling: krav.avdeling,
  underavdeling: krav.underavdeling,
  relevansFor: krav.relevansFor || [],
  status: krav.status || EKravStatus.UTKAST,
  suksesskriterier: krav.suksesskriterier || [
    { id: 0, navn: '', beskrivelse: '', behovForBegrunnelse: true },
  ],
  nyKravVersjon: krav.nyKravVersjon || false,
  tema:
    (krav.regelverk &&
      krav.regelverk?.length > 0 &&
      krav.regelverk[0].lov &&
      krav.regelverk[0].lov.data &&
      krav.regelverk[0].lov.data.tema) ||
    '',
  kravRelasjoner: krav.kravRelasjoner || [],
  // not used
  begrepIder: [],
  etterlevelser: [],
  kravIdRelasjoner: [],
  aktivertDato: krav.aktivertDato || '',
  prioriteringsId: 0,
})

export const kravMainHeaderSearch = async (searchParam: string): Promise<TSearchItem[]> => {
  let result: TSearchItem[] = []
  const add = (items: TSearchItem[]): void => {
    result = [...result, ...items]
    result = result.filter(
      (item: TSearchItem, index: number, self: TSearchItem[]) =>
        index === self.findIndex((searchItem: TSearchItem) => searchItem.value === item.value)
    )
  }

  if (searchParam) {
    result.push(
      ...(await searchKrav(searchParam))
        .filter((krav: IKrav) => krav.status !== EKravStatus.UTGAATT)
        .map(kravMap)
    )
  }

  let kravNumber: string = searchParam

  if (kravNumber[0].toLowerCase() === 'k') {
    kravNumber = kravNumber.substring(1)
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 === 0) {
    add(
      (await searchKravByNumber(Number.parseFloat(kravNumber).toString()))
        .filter((krav: IKrav) => krav.status !== EKravStatus.UTGAATT)
        .sort((a: IKrav, b: IKrav) => {
          if (a.kravNummer === b.kravNummer) {
            return b.kravVersjon - a.kravVersjon
          } else {
            return b.kravNummer - a.kravNummer
          }
        })
        .map(kravMap)
    )
  }

  if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
    const kravNummerMedVersjon: string[] = kravNumber.split('.')
    const searchResult: (IKrav | undefined)[] = [
      await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1]),
    ].filter((krav: IKrav | undefined) => krav && krav.status !== EKravStatus.UTGAATT)
    if (typeof searchResult[0] !== 'undefined') {
      const mappedResult: {
        value: string
        label: string
        tag: EObjectType
        url: string
      }[] = [
        {
          value: searchResult[0].kravId,
          label: kravName(searchResult[0]),
          tag: EObjectType.Krav,
          url: `krav/${searchResult[0].kravId}`,
        },
      ]
      add(mappedResult)
    }
  }
  return result
}
