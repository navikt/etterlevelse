import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  IKrav,
  IPageResponse,
} from '../constants'
import { env } from '../util/env'
import { TKravId } from './KravApi'

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
      krav.suksesskriterier.forEach((suksesskriterium) => {
        suksesskriterieBegrunnelser.map((suksesskriteriumBegrunnelse) => {
          if (suksesskriteriumBegrunnelse.suksesskriterieId === suksesskriterium.id) {
            suksesskriteriumBegrunnelse.behovForBegrunnelse = suksesskriterium.behovForBegrunnelse
          }
          return suksesskriteriumBegrunnelse
        })
      })
    } else {
      krav.suksesskriterier.forEach((suksesskriterium) => {
        suksesskriterieBegrunnelser.push({
          suksesskriterieId: suksesskriterium.id,
          behovForBegrunnelse: suksesskriterium.behovForBegrunnelse,
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
