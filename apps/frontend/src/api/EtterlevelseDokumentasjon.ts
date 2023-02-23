import axios from "axios"
import {EtterlevelseDokumentasjon, PageResponse} from "../constants"
import {env} from "../util/env"
import {useEffect, useState} from "react";


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
export const updateEtterlevelseDokumentasjon = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjon) => {
  const dto = etterlevelseDokumentasjonToDto(etterlevelseDokumentasjon)
  return (await axios.put<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjon.id}`, dto)).data
}

export const createEtterlevelseDokumentasjon = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjon) => {
  const dto = etterlevelseDokumentasjonToDto(etterlevelseDokumentasjon)
  return (await axios.post<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/`, dto)).data
}

export const deleteEtterlevelseDokumentasjon = async (etterlevelseDokumentasjonId: string) => {
  return (await axios.delete<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`)).data
}

export const useEtterlevelseDokumentasjon = (etterlevelseDokumentasjonId?: string, behandlingId?: string) => {
  const isCreateNew = etterlevelseDokumentasjonId === 'ny'
  const [data, setData] = useState<EtterlevelseDokumentasjon | undefined>(isCreateNew ? etterlevelseDokumentasjonMapToFormVal({}) : undefined)
  useEffect(() => {
    etterlevelseDokumentasjonId && !isCreateNew && getEtterlevelseDokumentasjon(etterlevelseDokumentasjonId).then(setData)
  }, [etterlevelseDokumentasjonId])

  return [data, setData] as [EtterlevelseDokumentasjon | undefined, (e: EtterlevelseDokumentasjon) => void]
}

function etterlevelseDokumentasjonToDto(etterlevelseDokumentasjon: EtterlevelseDokumentasjon): EtterlevelseDokumentasjon {
  const dto = {
    ...etterlevelseDokumentasjon,
    irrelevansFor: etterlevelseDokumentasjon.irrelevansFor.map((c) => c.code)
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const etterlevelseDokumentasjonMapToFormVal = (etterlevelseDokumentasjon: Partial<EtterlevelseDokumentasjon>): EtterlevelseDokumentasjon => ({
  id: etterlevelseDokumentasjon.id || '',
  changeStamp: etterlevelseDokumentasjon.changeStamp || {lastModifiedDate: '', lastModifiedBy: ''},
  version: -1,
  title: etterlevelseDokumentasjon.title || '',
  behandlingId: etterlevelseDokumentasjon.behandlingId || '',
  irrelevansFor: etterlevelseDokumentasjon.irrelevansFor || [],
  etterlevelseNummer: etterlevelseDokumentasjon.etterlevelseNummer || 0
})

