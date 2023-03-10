import axios from 'axios'
import { Behandling, EtterlevelseDokumentasjon, PageResponse, Team } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import { getBehandling } from './BehandlingApi'
import { getTeam, getTeams } from './TeamApi'

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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const setDataWithBehandling = (mainData: EtterlevelseDokumentasjon, behandlingData: Behandling) => {
    setData({
      ...mainData,
      behandling: behandlingData,
    })
  }

  useEffect(() => {
    setIsLoading(true)
    if (etterlevelseDokumentasjonId && !isCreateNew) {
      getEtterlevelseDokumentasjon(etterlevelseDokumentasjonId).then((etterlevelseDokumentasjon) => {
        if (etterlevelseDokumentasjon.behandlingId) {
          getBehandling(etterlevelseDokumentasjon.behandlingId).then((behandlingData) => {
            setDataWithBehandling(etterlevelseDokumentasjon, behandlingData)
          })
        } if (etterlevelseDokumentasjon.teams.length > 0) {
          getTeams(etterlevelseDokumentasjon.teams).then((teamsData) => {
            console.log({...etterlevelseDokumentasjon, teamsData: teamsData})
            setData({...etterlevelseDokumentasjon, teamsData: teamsData})
          })
        } else {
          setData(etterlevelseDokumentasjon)
        }
        setIsLoading(false)
      })
    } else if (behandlingId) {
      searchEtterlevelsedokumentasjonByBehandlingId(behandlingId).then((etterlevelseDokumentasjon) => {
        if (etterlevelseDokumentasjon) {
          getBehandling(behandlingId).then((behandlingData) => {
            setDataWithBehandling(etterlevelseDokumentasjon[0], behandlingData)
          })

          if (etterlevelseDokumentasjon[0].teams.length > 0) {
            getTeams(etterlevelseDokumentasjon[0].teams).then((teamsData) => {
              setData({...etterlevelseDokumentasjon[0], teamsData: teamsData})
            })
          }
          
          setIsLoading(false)
        }
      })
    }
  }, [etterlevelseDokumentasjonId, behandlingId])

  return [data, setData, isLoading] as [EtterlevelseDokumentasjon | undefined, (e: EtterlevelseDokumentasjon) => void, boolean]
}

export const etterlevelseDokumentasjonToDto = (etterlevelseDokumentasjon: EtterlevelseDokumentasjon): EtterlevelseDokumentasjon => {
  const dto = {
    ...etterlevelseDokumentasjon,
    irrelevansFor: etterlevelseDokumentasjon.irrelevansFor.map((c) => c.code),
    teams: etterlevelseDokumentasjon.teamsData?.map((t) => t.id),
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.teamsData
  return dto
}

export const etterlevelseDokumentasjonMapToFormVal = (etterlevelseDokumentasjon: Partial<EtterlevelseDokumentasjon>): EtterlevelseDokumentasjon => ({
  id: etterlevelseDokumentasjon.id || '',
  changeStamp: etterlevelseDokumentasjon.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
  title: etterlevelseDokumentasjon.title || '',
  behandlingId: etterlevelseDokumentasjon.behandlingId || '',
  irrelevansFor: etterlevelseDokumentasjon.irrelevansFor || [],
  etterlevelseNummer: etterlevelseDokumentasjon.etterlevelseNummer || 0,
  teams: etterlevelseDokumentasjon.teams || [],
  teamsData: etterlevelseDokumentasjon.teamsData || []
})
