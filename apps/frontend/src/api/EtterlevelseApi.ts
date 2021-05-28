import axios from 'axios'
import {emptyPage, Etterlevelse, EtterlevelseStatus, PageResponse} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'
import * as queryString from 'querystring'
import { getKravByKravNummer, KravId} from './KravApi'

export const getEtterlevelsePage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getEtterlevelseFor = async (query: {behandling: string}) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse?${queryString.stringify(query)}`)).data.content
}

export const getEtterlevelse = async (id: string) => {
  return (await axios.get<Etterlevelse>(`${env.backendBaseUrl}/etterlevelse/${id}`)).data
}

export const deleteEtterlevelse = async (id: string) => {
  return (await axios.delete<Etterlevelse>(`${env.backendBaseUrl}/etterlevelse/${id}`)).data
}

export const createEtterlevelse = async (etterlevelse: Etterlevelse) => {
  const dto = etterlevelseToEtterlevelseDto(etterlevelse)
  return (await axios.post<Etterlevelse>(`${env.backendBaseUrl}/etterlevelse`, dto)).data
}

export const updateEtterlevelse = async (etterlevelse: Etterlevelse) => {
  const dto = etterlevelseToEtterlevelseDto(etterlevelse)
  return (await axios.put<Etterlevelse>(`${env.backendBaseUrl}/etterlevelse/${etterlevelse.id}`, dto)).data
}

function etterlevelseToEtterlevelseDto(etterlevelse: Etterlevelse) {
  const dto = {
    ...etterlevelse,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useEtterlevelsePage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Etterlevelse>>(emptyPage)
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEtterlevelsePage(page, pageSize).then(r => {
      setData(r)
      setLoading(false)
    })
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage, loading] as [PageResponse<Etterlevelse>, () => void, () => void, boolean]
}

export const useEtterlevelse = (id?: string, behandlingId?: string, kravId?: KravId) => {
  const isCreateNew = id === 'ny'
  const [data, setData] = useState<Etterlevelse | undefined>(isCreateNew ? mapToFormVal({
    behandlingId,
    kravVersjon: kravId?.kravVersjon,
    kravNummer: kravId?.kravNummer
  }) : undefined)

  const [kravNavn, setKravNavn] = useState('')

  useEffect(() => {
    id && !isCreateNew && getEtterlevelse(id).then(setData)
  }, [id])
  
  useEffect(() => {
    data && getKravByKravNummer(data?.kravNummer, data?.kravVersjon).then((res) => setKravNavn(res.navn))
  }, [data])

  return [data, setData, kravNavn] as [Etterlevelse | undefined, (k: Etterlevelse) => void, String]
}

export const useEtterlevelseForBehandling = (behandlingId?: string) => {
  const [data, setData] = useState<Etterlevelse[]>([])

  useEffect(() => {
    behandlingId && getEtterlevelseFor({behandling: behandlingId}).then(setData)
  }, [behandlingId])

  return data
}

export const mapToFormVal = (etterlevelse: Partial<Etterlevelse>): Etterlevelse => ({
  id: etterlevelse.id || '',
  behandlingId: etterlevelse.behandlingId || '',
  kravNummer: etterlevelse.kravNummer || 0,
  kravVersjon: etterlevelse.kravVersjon || 0,
  changeStamp: etterlevelse.changeStamp || {lastModifiedDate: '', lastModifiedBy: ''},
  version: -1,
  etterleves: etterlevelse.etterleves || false,
  begrunnelse: etterlevelse.begrunnelse || '',
  dokumentasjon: etterlevelse.dokumentasjon || [],
  fristForFerdigstillelse: etterlevelse.fristForFerdigstillelse || '',
  status: etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING,
})
