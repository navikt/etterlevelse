import axios from 'axios'
import { useEffect, useState } from 'react'
import { EtterlevelseArkiv, EtterlevelseArkivStatus, PageResponse } from '../constants'
import { env } from '../util/env'

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

export const getEtterlevelseArkivByEtterlevelseDokumentasjonId = async (etterlevelseDokumentasjonId: string) => {
  return (await axios.get<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`)).data
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

export const updateAsAdminEtterlevelseArkiv = async (etterlevelseArkiv: EtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (await axios.put<EtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/admin/update/${etterlevelseArkiv.id}`, dto)).data
}

export const updateToArkivert = async (failedToArchiveEtterlevelseNr: String[]) => {
  return (await axios.put<PageResponse<EtterlevelseArkiv>>(`${env.backendBaseUrl}/etterlevelsearkiv/status/arkivert`, { failedToArchiveEtterlevelseNr })).data
}

function etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv: EtterlevelseArkiv) {
  const dto = {
    ...etterlevelseArkiv,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useArkiveringByEtterlevelseDokumentasjonId = (etterlevelseDokumentasjonId?: string) => {
  const [data, setData] = useState<EtterlevelseArkiv | undefined>(undefined)

  useEffect(() => {
    etterlevelseDokumentasjonId && etterlevelseDokumentasjonId !== '' &&
      getEtterlevelseArkivByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
        .then((resp) => setData(arkiveringMapToFormVal(resp.content[0])))
        .catch((e) => {
          setData(arkiveringMapToFormVal({ id: '' }))
          console.log("couldn't find arkivering with etterlevelse dokumentasjon id = ", e)
        })
  }, [etterlevelseDokumentasjonId])

  return [data, setData] as [EtterlevelseArkiv | undefined, (etterlevelseArkiv: EtterlevelseArkiv | undefined) => void]
}

export const arkiveringMapToFormVal = (arkivering: Partial<EtterlevelseArkiv>): EtterlevelseArkiv => ({
  id: arkivering.id || '',
  behandlingId: arkivering.behandlingId || '',
  etterlevelseDokumentasjonId: arkivering.etterlevelseDokumentasjonId || '',
  status: arkivering.status || EtterlevelseArkivStatus.IKKE_ARKIVER,
  arkiveringDato: arkivering.arkiveringDato || '',
  arkivertAv: arkivering.arkivertAv || '',
  tilArkiveringDato: arkivering.tilArkiveringDato || '',
  arkiveringAvbruttDato: arkivering.arkiveringAvbruttDato || '',
  webSakNummer: arkivering.webSakNummer || '',
  changeStamp: arkivering.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: arkivering.version || -1,
})

export const arkiveringStatusToString = (status: EtterlevelseArkivStatus): string => {
  switch (status) {
    case EtterlevelseArkivStatus.TIL_ARKIVERING:
      return 'Til arkivering'
    case EtterlevelseArkivStatus.BEHANDLER_ARKIVERING:
      return 'Behandler arkivering'
    case EtterlevelseArkivStatus.ERROR:
      return 'Error'
    case EtterlevelseArkivStatus.ARKIVERT:
      return 'Arkivert'
    case EtterlevelseArkivStatus.IKKE_ARKIVER:
      return 'Ikke arkiver'
  }
}
