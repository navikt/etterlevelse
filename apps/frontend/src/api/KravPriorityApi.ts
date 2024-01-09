import axios from 'axios'
import { IKravPrioritering, KravQL, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAllKravPriority = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPriorityPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKravPrioritering: IKravPrioritering[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKravPrioritering = [...allKravPrioritering, ...(await getKravPriorityPage(currentPage, PAGE_SIZE)).content]
    }
    return allKravPrioritering
  }
}

export const getKravPriorityPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<IPageResponse<IKravPrioritering>>(`${env.backendBaseUrl}/kravprioritering?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKravPriority = async (id: string) => {
  return (await axios.get<IKravPrioritering>(`${env.backendBaseUrl}/kravprioritering/${id}`)).data
}

export const getKravPriorityByKravNumberAndVersion = async (kravNummer: number | string, kravVersjon: number | string) => {
  return await axios
    .get<IKravPrioritering>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravPriorityByTemaCode = async (temaCode: string) => {
  return await axios
    .get<IKravPrioritering>(`${env.backendBaseUrl}/kravprioritering/tema/${temaCode}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravPriorityByKravNummer = async (kravNummer: number | string) => {
  return (await axios.get<IPageResponse<IKravPrioritering>>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}`)).data
}

export const createKravPriority = async (kravPrioritering: IKravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.post<IKravPrioritering>(`${env.backendBaseUrl}/kravprioritering`, dto)).data
}

export const updateKravPriority = async (kravPrioritering: IKravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.put<IKravPrioritering>(`${env.backendBaseUrl}/kravprioritering/${kravPrioritering.id}`, dto)).data
}

function kravPrioriteringToDto(kravPrioriteringToDto: IKravPrioritering): IKravPrioritering {
  const dto = {
    ...kravPrioriteringToDto,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const kravMapToKravPrioriting = (krav: Partial<KravQL>): IKravPrioritering => ({
  id: krav.kravPriorityUID || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  prioriteringsId: krav.prioriteringsId || '',
  changeStamp: krav.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
})
