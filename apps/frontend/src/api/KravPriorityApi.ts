import axios from 'axios'
import { Krav, KravPrioritering, PageResponse} from '../constants'
import {env} from '../util/env'


export const getAllKravPrioritering = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPrioriteringPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKrav: Krav[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKrav = [...allKrav, ...(await getKravPrioriteringPage(currentPage, PAGE_SIZE)).content]
    }
    return allKrav
  }
}

export const getKravPrioriteringPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/kravprioritering?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKravPrioritering = async (id: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/kravprioritering/${id}`)).data
}

export const getKravByKravNumberAndVersion = async (kravNummer: number | string, kravVersjon: number | string) => {
  return await axios
    .get<Krav>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravByKravNummer = async (kravNummer: number | string) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}`)).data
}

export const createKrav = async (kravPrioritering: KravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.post<Krav>(`${env.backendBaseUrl}/kravprioritering`, dto)).data
}

export const updateKrav = async (kravPrioritering: KravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.put<Krav>(`${env.backendBaseUrl}/kravprioritering/${kravPrioritering.id}`, dto)).data
}

function kravPrioriteringToDto(kravPrioriteringToDto: KravPrioritering): KravPrioritering {
  const dto = {
    ...kravPrioriteringToDto,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}