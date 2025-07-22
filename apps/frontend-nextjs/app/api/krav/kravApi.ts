import { EObjectType } from '@/components/kraveier/admin/audit/audit'
import { IBehandling } from '@/constants/common/behandlingskatalogen/constants'
import { IPageResponse } from '@/constants/constant'
import { EKravStatus, IKrav } from '@/constants/etterlevelse/krav/constants'
import { TSearchItem } from '@/constants/other/search/constants'
import { kravMap, kravName } from '@/util/krav/kravUtil'
import axios from 'axios'
import { env } from 'process'

const searchKrav = async (name: string): Promise<IKrav[]> => {
  return (await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data
    .content
}

export const searchBehandling = async (name: string): Promise<IBehandling[]> => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
  ).data.content
}

export const behandlingName = (behandling?: IBehandling): string => {
  let behandlingName = ''

  if (behandling) {
    if (behandling.nummer) {
      behandlingName += 'B' + behandling.nummer + ' '
    }
    if (behandling.overordnetFormaal && behandling.overordnetFormaal.shortName) {
      behandlingName += behandling.overordnetFormaal.shortName + ': '
    }
    if (behandling.navn) {
      behandlingName += behandling.navn
    }
  }

  return behandlingName
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

export const kravSearch = async (searchParam: string): Promise<TSearchItem[]> => {
  let result: TSearchItem[] = []
  const add: (items: TSearchItem[]) => void = (items: TSearchItem[]): void => {
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
          value: searchResult[0].id,
          label: kravName(searchResult[0]),
          tag: EObjectType.Krav,
          url: `krav/${searchResult[0].id}`,
        },
      ]
      add(mappedResult)
    }
  }
  return result
}
