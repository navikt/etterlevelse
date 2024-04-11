import axios from 'axios'
import { useEffect, useState } from 'react'
import { EEtterlevelseArkivStatus, IEtterlevelseArkiv, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAllArkivering = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getArkiveringPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allEtterlevelseArkiv: IEtterlevelseArkiv[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allEtterlevelseArkiv = [
        ...allEtterlevelseArkiv,
        ...(await getArkiveringPage(currentPage, PAGE_SIZE)).content,
      ]
    }
    return allEtterlevelseArkiv
  }
}

export const getArkiveringPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IEtterlevelseArkiv>>(
      `${env.backendBaseUrl}/etterlevelsearkiv?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getEtterlevelseArkiv = async (id: string) => {
  return (await axios.get<IEtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/${id}`)).data
}

export const getEtterlevelseArkivByEtterlevelseDokumentasjonId = async (
  etterlevelseDokumentasjonId: string
) => {
  return (
    await axios.get<IPageResponse<IEtterlevelseArkiv>>(
      `${env.backendBaseUrl}/etterlevelsearkiv/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`
    )
  ).data
}

export const createEtterlevelseArkiv = async (etterlevelseArkiv: IEtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (await axios.post<IEtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv`, dto)).data
}

export const deleteEtterlevelseArkiv = async (id: string) => {
  return (await axios.delete<IEtterlevelseArkiv>(`${env.backendBaseUrl}/etterlevelsearkiv/${id}`))
    .data
}

export const updateEtterlevelseArkiv = async (etterlevelseArkiv: IEtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (
    await axios.put<IEtterlevelseArkiv>(
      `${env.backendBaseUrl}/etterlevelsearkiv/${etterlevelseArkiv.id}`,
      dto
    )
  ).data
}

export const updateAsAdminEtterlevelseArkiv = async (etterlevelseArkiv: IEtterlevelseArkiv) => {
  const dto = etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv)
  return (
    await axios.put<IEtterlevelseArkiv>(
      `${env.backendBaseUrl}/etterlevelsearkiv/admin/update/${etterlevelseArkiv.id}`,
      dto
    )
  ).data
}

function etterlevelseArkivToEtterlevelseArkivDto(etterlevelseArkiv: IEtterlevelseArkiv) {
  const dto = {
    ...etterlevelseArkiv,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useArkiveringByEtterlevelseDokumentasjonId = (
  etterlevelseDokumentasjonId?: string
) => {
  const [data, setData] = useState<IEtterlevelseArkiv | undefined>(undefined)

  useEffect(() => {
    if (etterlevelseDokumentasjonId !== undefined && etterlevelseDokumentasjonId !== '') {
      getEtterlevelseArkivByEtterlevelseDokumentasjonId(etterlevelseDokumentasjonId)
        .then((resp) => {
          if (resp.content.length) {
            setData(arkiveringMapToFormVal(resp.content[0]))
          } else {
            setData(arkiveringMapToFormVal({}))
          }
        })
        .catch((e) => {
          setData(arkiveringMapToFormVal({ id: '' }))
          console.error("couldn't find arkivering with etterlevelse dokumentasjon id = ", e)
        })
    }
  }, [etterlevelseDokumentasjonId])

  return [data, setData] as [
    IEtterlevelseArkiv | undefined,
    (etterlevelseArkiv: IEtterlevelseArkiv | undefined) => void,
  ]
}

export const arkiveringMapToFormVal = (
  arkivering: Partial<IEtterlevelseArkiv>
): IEtterlevelseArkiv => ({
  id: arkivering.id || '',
  behandlingId: arkivering.behandlingId || '',
  etterlevelseDokumentasjonId: arkivering.etterlevelseDokumentasjonId || '',
  status: arkivering.status || EEtterlevelseArkivStatus.IKKE_ARKIVER,
  arkiveringDato: arkivering.arkiveringDato || '',
  arkivertAv: arkivering.arkivertAv || '',
  tilArkiveringDato: arkivering.tilArkiveringDato || '',
  arkiveringAvbruttDato: arkivering.arkiveringAvbruttDato || '',
  webSakNummer: arkivering.webSakNummer || '',
  onlyActiveKrav: arkivering.onlyActiveKrav || false,
  changeStamp: arkivering.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: arkivering.version || -1,
})

export const arkiveringStatusToString = (status: EEtterlevelseArkivStatus): string => {
  switch (status) {
    case EEtterlevelseArkivStatus.TIL_ARKIVERING:
      return 'Til arkivering'
    case EEtterlevelseArkivStatus.BEHANDLER_ARKIVERING:
      return 'Behandler arkivering'
    case EEtterlevelseArkivStatus.ERROR:
      return 'Error'
    case EEtterlevelseArkivStatus.ARKIVERT:
      return 'Arkivert'
    case EEtterlevelseArkivStatus.IKKE_ARKIVER:
      return 'Ikke arkiver'
  }
}
