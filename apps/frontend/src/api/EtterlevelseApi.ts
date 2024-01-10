import axios from 'axios'
import queryString from 'query-string'
import { useEffect, useState } from 'react'
import {
    EEtterlevelseStatus,
    ESuksesskriterieStatus,
    IEtterlevelse,
    IKrav,
    IPageResponse,
    emptyPage,
} from '../constants'
import { env } from '../util/env'
import { TKravId } from './KravApi'

export const getEtterlevelsePage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IEtterlevelse>>(
      `${env.backendBaseUrl}/etterlevelse?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getEtterlevelseFor = async (query: { behandling: string }) => {
  return (
    await axios.get<IPageResponse<IEtterlevelse>>(
      `${env.backendBaseUrl}/etterlevelse?${queryString.stringify(query)}`
    )
  ).data.content
}

export const getEtterlevelse = async (id: string) => {
  return (await axios.get<IEtterlevelse>(`${env.backendBaseUrl}/etterlevelse/${id}`)).data
}

export const getEtterlevelserByKravNumberKravVersion = async (
  kravNummer: number,
  kravVersjon: number
) => {
  return (
    await axios.get<IPageResponse<IEtterlevelse>>(
      `${env.backendBaseUrl}/etterlevelse/kravnummer/${kravNummer}/${kravVersjon}`
    )
  ).data
}

export const getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber = async (
  etterlevelseDokumentasjonId: string,
  kravNummer: number
) => {
  return (
    await axios.get<IPageResponse<IEtterlevelse>>(
      `${env.backendBaseUrl}/etterlevelse/etterlevelseDokumentasjon/${etterlevelseDokumentasjonId}/${kravNummer}`
    )
  ).data
}

export const deleteEtterlevelse = async (id: string) => {
  return (await axios.delete<IEtterlevelse>(`${env.backendBaseUrl}/etterlevelse/${id}`)).data
}

export const createEtterlevelse = async (etterlevelse: IEtterlevelse) => {
  const dto = etterlevelseToEtterlevelseDto(etterlevelse)
  return (await axios.post<IEtterlevelse>(`${env.backendBaseUrl}/etterlevelse`, dto)).data
}

export const updateEtterlevelse = async (etterlevelse: IEtterlevelse) => {
  const dto = etterlevelseToEtterlevelseDto(etterlevelse)
  return (
    await axios.put<IEtterlevelse>(`${env.backendBaseUrl}/etterlevelse/${etterlevelse.id}`, dto)
  ).data
}

function etterlevelseToEtterlevelseDto(etterlevelse: IEtterlevelse) {
  const dto = {
    ...etterlevelse,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useEtterlevelsePage = (pageSize: number) => {
  const [data, setData] = useState<IPageResponse<IEtterlevelse>>(emptyPage)
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

  return [data, prevPage, nextPage, loading] as [
    IPageResponse<IEtterlevelse>,
    () => void,
    () => void,
    boolean,
  ]
}

export const useEtterlevelse = (id?: string, behandlingId?: string, kravId?: TKravId) => {
  const isCreateNew = id === 'ny'
  const [data, setData] = useState<IEtterlevelse | undefined>(
    isCreateNew
      ? mapEtterlevelseToFormValue({
          behandlingId,
          kravVersjon: kravId?.kravVersjon,
          kravNummer: kravId?.kravNummer,
        })
      : undefined
  )

  useEffect(() => {
    id && !isCreateNew && getEtterlevelse(id).then(setData)
  }, [id])

  return [data, setData] as [IEtterlevelse | undefined, (k: IEtterlevelse) => void]
}

export const mapEtterlevelseToFormValue = (
  etterlevelse: Partial<IEtterlevelse>,
  krav?: IKrav
): IEtterlevelse => {
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
          suksesskriterieStatus: ESuksesskriterieStatus.UNDER_ARBEID,
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
    status: etterlevelse.status || EEtterlevelseStatus.UNDER_REDIGERING,
  }
}
