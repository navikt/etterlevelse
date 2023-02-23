import axios from "axios"
import { EtterlevelseDokumentasjon, PageResponse } from "../constants"
import { env } from "../util/env"






export const getEtterlevelseDokumentasjon = async (id: string) => {
  return (await axios.get<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/${id}`)).data
}


export const getAllEtterlevelseDokumentasjon = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getEtterlevelseDokumentasjonPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allEtterlevelseDokumentasjon: EtterlevelseDokumentasjon[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allEtterlevelseDokumentasjon = [...allEtterlevelseDokumentasjon, ...(await getEtterlevelseDokumentasjonPage(currentPage, PAGE_SIZE)).content]
    }
    return allEtterlevelseDokumentasjon
  }
}

export const getEtterlevelseDokumentasjonPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<EtterlevelseDokumentasjon>>(`${env.backendBaseUrl}/etterlevelsedokumentasjon?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const searchEtterlevelsedokumentasjon = async (searchParam: string) => {
  return (await axios.get<PageResponse<EtterlevelseDokumentasjon>>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/search/${searchParam}`)).data.content
}

export const searchEtterlevelsedokumentasjonByBehandlingId = async (behandlingId: string) => {
  return (await axios.get<PageResponse<EtterlevelseDokumentasjon>>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/search/behandling/${behandlingId}`)).data.content
}