import axios from 'axios'
import { useEffect, useState } from 'react'
import {EtterlevelseArkiv, EtterlevelseArkivStatus, PageResponse} from '../constants'
import {env} from '../util/env'

export const getAllArkivering = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getArkiveringPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allEtterlevelseArkiv: EtterlevelseArkiv[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allEtterlevelseArkiv = [...allEtterlevelseArkiv, ...(await getArkiveringPage(currentPage, PAGE_SIZE)).content]
    }
    return allEtterlevelseArkiv
  }
}

export const getArkiveringPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getEtterlevelseArkiv = async (id: string) => {
  return (await axios.get<EtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/${id}`)).data
}

export const getEtterlevelseArkivByWebsak = async (websakNummer: string) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/websaknummer/${websakNummer}`)).data
}

export const getEtterlevelseArkivByStatus = async (status: EtterlevelseArkivStatus) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/status/${status}`)).data
}

export const getEtterlevelseArkivArkivert = async () => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/status/arkivert`)).data
}

export const getEtterlevelseArkivByBehandlingId = async (behandlingId: string) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/behandling/${behandlingId}`)).data
}

export const createEtterlevelseArkiv = async (etterlevelseArkiv: EtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (await axios.post<EtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv`, dto)).data
}

export const deleteEtterlevelseArkiv = async (id: string) => {
  return (await axios.delete<EtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/${id}`)).data
}

export const updateEtterlevelseArkiv = async (etterlevelseArkiv: EtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (await axios.put<EtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/${etterlevelseArkiv.id}`, dto)).data
}

function etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv: EtterlevelseArkiv) {
  const dto = {
    ...etterlevelseArkiv,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useArkiveringByBehandlingId = (behandlingsId?: string) => {
  const [data, setData] = useState<EtterlevelseArkiv | undefined>(undefined)

  useEffect(() => {
    behandlingsId &&
    getEtterlevelseArkivByBehandlingId(behandlingsId)
        .then((resp) => setData(resp.content[0]))
        .catch((e) => {
          setData(undefined)
          console.log("couldn't find behandling", e)
        })
  }, [behandlingsId])

  return [data, setData] as [EtterlevelseArkiv | undefined, (etterlevelseArkiv: EtterlevelseArkiv | undefined) => void]
}