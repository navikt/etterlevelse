import axios from 'axios'
import { EtterlevelseDokumentasjon, EtterlevelseDokumentasjonQL, PageResponse } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import { getVirkemiddel } from './VirkemiddelApi'
import * as yup from 'yup'
import { behandlingName } from './BehandlingApi'

export const etterlevelseDokumentasjonName = (etterlevelseDokumentasjon?: EtterlevelseDokumentasjon) =>
  etterlevelseDokumentasjon ? 'E' + etterlevelseDokumentasjon.etterlevelseNummer + ' ' + etterlevelseDokumentasjon.title : ''

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
export const searchEtterlevelsedokumentasjonByVirkemiddelId = async (virkemiddelId: string) => {
  return (await axios.get<PageResponse<EtterlevelseDokumentasjon>>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/search/virkemiddel/${virkemiddelId}`)).data.content
}
export const updateEtterlevelseDokumentasjon = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
  const dto = etterlevelseDokumentasjonToDto(etterlevelseDokumentasjon)
  return (await axios.put<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjon.id}`, dto)).data
}

export const createEtterlevelseDokumentasjon = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
  const dto = etterlevelseDokumentasjonToDto(etterlevelseDokumentasjon)
  return (await axios.post<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon`, dto)).data
}

export const deleteEtterlevelseDokumentasjon = async (etterlevelseDokumentasjonId: string) => {
  return (await axios.delete<EtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`)).data
}

export const useEtterlevelseDokumentasjon = (etterlevelseDokumentasjonId?: string) => {
  const isCreateNew = etterlevelseDokumentasjonId === 'ny'
  const [data, setData] = useState<EtterlevelseDokumentasjonQL | undefined>(isCreateNew ? etterlevelseDokumentasjonMapToFormVal({}) : undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    let virkmiddel: any = {}

    setIsLoading(true)
    if (etterlevelseDokumentasjonId && !isCreateNew) {
      ;(async () => {
        await getEtterlevelseDokumentasjon(etterlevelseDokumentasjonId).then(async (etterlevelseDokumentasjon) => {
          if (etterlevelseDokumentasjon.virkemiddelId) {
            await getVirkemiddel(etterlevelseDokumentasjon.virkemiddelId).then((virkemiddelResponse) => (virkmiddel = virkemiddelResponse))
          }
          const behandlinger = etterlevelseDokumentasjon.behandlinger
          if (behandlinger && behandlinger.length > 0) {
            behandlinger.map((b) => {
              b.navn = behandlingName(b)
              return b
            })
          }
          setData({ ...etterlevelseDokumentasjon, behandlinger: behandlinger, virkemiddel: virkmiddel })
          setIsLoading(false)
        })
      })()
    }
  }, [etterlevelseDokumentasjonId])

  return [data, setData, isLoading] as [EtterlevelseDokumentasjonQL | undefined, (e: EtterlevelseDokumentasjonQL) => void, boolean]
}

export const etterlevelseDokumentasjonToDto = (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL): EtterlevelseDokumentasjon => {
  const dto = {
    ...etterlevelseDokumentasjon,
    behandlingIds: etterlevelseDokumentasjon.behandlinger?.map((b) => b.id),
    irrelevansFor: etterlevelseDokumentasjon.irrelevansFor.map((c) => c.code),
    teams: etterlevelseDokumentasjon.teamsData?.map((t) => t.id),
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.teamsData
  delete dto.behandlinger
  return dto
}

export const etterlevelseDokumentasjonMapToFormVal = (etterlevelseDokumentasjon: Partial<EtterlevelseDokumentasjonQL>): EtterlevelseDokumentasjonQL => ({
  id: etterlevelseDokumentasjon.id || '',
  changeStamp: etterlevelseDokumentasjon.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
  title: etterlevelseDokumentasjon.title || '',
  behandlingIds: etterlevelseDokumentasjon.behandlingIds || [],
  behandlerPersonopplysninger: etterlevelseDokumentasjon.behandlerPersonopplysninger !== undefined ? etterlevelseDokumentasjon.behandlerPersonopplysninger : true,
  irrelevansFor: etterlevelseDokumentasjon.irrelevansFor || [],
  etterlevelseNummer: etterlevelseDokumentasjon.etterlevelseNummer || 0,
  teams: etterlevelseDokumentasjon.teams || [],
  teamsData: etterlevelseDokumentasjon.teamsData || [],
  behandlinger: etterlevelseDokumentasjon.behandlinger || [],
  virkemiddelId: etterlevelseDokumentasjon.virkemiddelId || '',
  // knyttetTilVirkemiddel: etterlevelseDokumentasjon.knyttetTilVirkemiddel !== undefined ? etterlevelseDokumentasjon.knyttetTilVirkemiddel : false,
  knyttetTilVirkemiddel: false,
  knytteTilTeam: etterlevelseDokumentasjon.knytteTilTeam !== undefined ? etterlevelseDokumentasjon.knytteTilTeam : true,
})

export const etterlevelseDokumentasjonSchema = () =>
  yup.object({
    title: yup.string().required('Etterlevelsedokumentasjon trenger en tittel'),
    virkemiddelId: yup.string().test({
      name: 'addedVirkemiddelCheck',
      message: 'Hvis ditt system/produkt er tilknyttet et virkemiddel må det legges til.',
      test: function (virkemiddelId) {
        const { parent } = this
        if (parent.knyttetTilVirkemiddel === true) {
          return virkemiddelId ? true : false
        }
        return true
      },
    }),
  })
//graphql

export type EtterlevelseDokumentasjonFilter = {
  relevans?: string[]
}
