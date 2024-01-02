import axios from 'axios'
import queryString from 'query-string'
import { useEffect, useState } from 'react'
import { emptyPage, Etterlevelse, EtterlevelseStatus, Krav, PageResponse, SuksesskriterieStatus } from '../constants'
import { env } from '../util/env'
import { KravId } from './KravApi'

export const getEtterlevelsePage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getEtterlevelseFor = async (query: { behandling: string }) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse?${queryString.stringify(query)}`)).data.content
}

export const getEtterlevelse = async (id: string) => {
  return (await axios.get<Etterlevelse>(`${env.backendBaseUrl}/etterlevelse/${id}`)).data
}

export const getEtterlevelserByKravNumberKravVersion = async (kravNummer: number, kravVersjon: number) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse/kravnummer/${kravNummer}/${kravVersjon}`)).data
}

export const getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber = async (etterlevelseDokumentasjonId: string, kravNummer: number) => {
  return (await axios.get<PageResponse<Etterlevelse>>(`${env.backendBaseUrl}/etterlevelse/etterlevelseDokumentasjon/${etterlevelseDokumentasjonId}/${kravNummer}`)).data
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
    getEtterlevelsePage(page, pageSize).then((r) => {
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
  const [data, setData] = useState<Etterlevelse | undefined>(
    isCreateNew
      ? mapEtterlevelseToFormValue({
          behandlingId,
          kravVersjon: kravId?.kravVersjon,
          kravNummer: kravId?.kravNummer,
        })
      : undefined,
  )

  useEffect(() => {
    id && !isCreateNew && getEtterlevelse(id).then(setData)
  }, [id])

  return [data, setData] as [Etterlevelse | undefined, (k: Etterlevelse) => void]
}

export const mapEtterlevelseToFormValue = (etterlevelse: Partial<Etterlevelse>, krav?: Krav): Etterlevelse => {
  const suksesskriterieBegrunnelser = etterlevelse.suksesskriterieBegrunnelser || []

  if (krav) {
    if (suksesskriterieBegrunnelser.length) {
      krav.suksesskriterier.forEach((s) => {
        suksesskriterieBegrunnelser.map((sb) => {
          if (sb.suksesskriterieId === s.id) {
            sb.behovForBegrunnelse = s.behovForBegrunnelse
          }
          return sb
        })
      })
    } else {
      krav.suksesskriterier.forEach((s) => {
        suksesskriterieBegrunnelser.push({
          suksesskriterieId: s.id,
          behovForBegrunnelse: s.behovForBegrunnelse,
          begrunnelse: '',
          suksesskriterieStatus: SuksesskriterieStatus.UNDER_ARBEID,
        })
      })
    }
  }

  return {
    id: etterlevelse.id || '',
    behandlingId: etterlevelse.behandlingId || '',
    etterlevelseDokumentasjonId: etterlevelse.etterlevelseDokumentasjonId || '',
    kravNummer: etterlevelse.kravNummer || 0,
    kravVersjon: etterlevelse.kravVersjon || 0,
    changeStamp: etterlevelse.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    suksesskriterieBegrunnelser: suksesskriterieBegrunnelser,
    version: -1,
    etterleves: etterlevelse.etterleves || false,
    statusBegrunnelse: etterlevelse.statusBegrunnelse || '',
    dokumentasjon: etterlevelse.dokumentasjon || [],
    fristForFerdigstillelse: etterlevelse.fristForFerdigstillelse || '',
    status: etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING,
  }
}
