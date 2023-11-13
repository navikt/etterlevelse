import axios from 'axios'
import { KravPrioritering, KravQL, PageResponse } from '../constants'
import { env } from '../util/env'
import { gql } from '@apollo/client'

export const getAllKravPriority = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPriorityPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKravPrioritering: KravPrioritering[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKravPrioritering = [...allKravPrioritering, ...(await getKravPriorityPage(currentPage, PAGE_SIZE)).content]
    }
    return allKravPrioritering
  }
}

export const getKravPriorityPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<KravPrioritering>>(`${env.backendBaseUrl}/kravprioritering?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKravPriority = async (id: string) => {
  return (await axios.get<KravPrioritering>(`${env.backendBaseUrl}/kravprioritering/${id}`)).data
}

export const getKravPriorityByKravNumberAndVersion = async (kravNummer: number | string, kravVersjon: number | string) => {
  return await axios
    .get<KravPrioritering>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravPriorityByTemaCode = async (temaCode: string) => {
  return await axios
    .get<KravPrioritering>(`${env.backendBaseUrl}/kravprioritering/tema/${temaCode}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravPriorityByKravNummer = async (kravNummer: number | string) => {
  return (await axios.get<PageResponse<KravPrioritering>>(`${env.backendBaseUrl}/kravprioritering/kravnummer/${kravNummer}`)).data
}

export const createKravPriority = async (kravPrioritering: KravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.post<KravPrioritering>(`${env.backendBaseUrl}/kravprioritering`, dto)).data
}

export const updateKravPriority = async (kravPrioritering: KravPrioritering) => {
  const dto = kravPrioriteringToDto(kravPrioritering)
  return (await axios.put<KravPrioritering>(`${env.backendBaseUrl}/kravprioritering/${kravPrioritering.id}`, dto)).data
}

function kravPrioriteringToDto(kravPrioriteringToDto: KravPrioritering): KravPrioritering {
  const dto = {
    ...kravPrioriteringToDto,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const kravMapToKravPrioriting = (krav: Partial<KravQL>): KravPrioritering => ({
  id: krav.kravPriorityUID || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  prioriteringsId: krav.prioriteringsId || '',
  changeStamp: krav.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
})



export const kravPriorityQueryWithEtterlevelse = gql`
  query getKravPriorityByFilter($etterlevelseDokumentasjonId: String, $tema: String) {
    kravPrioritering(
      filter: {
        etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
        temaCode: $tema
      }
    ) {
      content {
        id
        kravVersjon
        kravNummer
        prioriteringsId
        kravNavn
        changeStamp {
          lastModifiedBy
          lastModifiedDate
          createdDate
        }
        etterlevelser(onlyForEtterlevelseDokumentasjon: true) {
          id
          etterleves
          fristForFerdigstillelse
          status
          changeStamp {
            lastModifiedBy
            lastModifiedDate
          }
        }
      }
    }
  }
`