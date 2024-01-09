import axios from 'axios'
import { useEffect, useState } from 'react'
import { EtterlevelseMetadata, IPageResponse } from '../constants'
import { env } from '../util/env'
import { KravId } from './KravApi'

export const getAllEtterlevelseMetadata = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getEtterlevelseMetadataByPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allEtterlevelseMetadata: EtterlevelseMetadata[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allEtterlevelseMetadata = [...allEtterlevelseMetadata, ...(await getEtterlevelseMetadataByPage(currentPage, PAGE_SIZE)).content]
    }
    return allEtterlevelseMetadata
  }
}

export const getEtterlevelseMetadataByPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<IPageResponse<EtterlevelseMetadata>>(`${env.backendBaseUrl}/etterlevelsemetadata?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getEtterlevelseMetadataByKravNummer = async (kravNummer: number | string) => {
  return (await axios.get<IPageResponse<EtterlevelseMetadata>>(`${env.backendBaseUrl}/etterlevelsemetadata/kravnummer/${kravNummer}`)).data
}

export const getEtterlevelseMetadataByKravNumberAndVersion = async (kravNummer: number | string, kravVersjon: number | string) => {
  return await axios
    .get<IPageResponse<EtterlevelseMetadata>>(`${env.backendBaseUrl}/etterlevelsemetadata/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion = async (
  etterlevelseDokumentasjonId: string,
  kravNummer: number,
  kravVersjon: number,
) => {
  return (
    await axios.get<IPageResponse<EtterlevelseMetadata>>(
      `${env.backendBaseUrl}/etterlevelsemetadata/etterlevelseDokumentasjon/${etterlevelseDokumentasjonId}/${kravNummer}/${kravVersjon}`,
    )
  ).data
}

export const getEtterlevelseMetadataById = async (id: string) => {
  return (await axios.get<EtterlevelseMetadata>(`${env.backendBaseUrl}/etterlevelsemetadata/${id}`)).data
}

export const deleteEtterlevelseMetadata = async (id: string) => {
  return (await axios.delete<EtterlevelseMetadata>(`${env.backendBaseUrl}/etterlevelsemetadata/${id}`)).data
}

export const createEtterlevelseMetadata = async (etterlevelseMetadata: EtterlevelseMetadata) => {
  const dto = etterlevelseMetadataToEtterlevelseMetadataDto(etterlevelseMetadata)
  return (await axios.post<EtterlevelseMetadata>(`${env.backendBaseUrl}/etterlevelsemetadata`, dto)).data
}

export const updateEtterlevelseMetadata = async (etterlevelseMetadata: EtterlevelseMetadata) => {
  const dto = etterlevelseMetadataToEtterlevelseMetadataDto(etterlevelseMetadata)
  return (await axios.put<EtterlevelseMetadata>(`${env.backendBaseUrl}/etterlevelsemetadata/${etterlevelseMetadata.id}`, dto)).data
}

function etterlevelseMetadataToEtterlevelseMetadataDto(etterlevelseMetadata: EtterlevelseMetadata): EtterlevelseMetadata {
  const dto = {
    ...etterlevelseMetadata,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useEtterlevelseMetadata = (id?: string, behandlingId?: string, kravId?: KravId) => {
  const isCreateNew = id === 'ny'
  const [data, setData] = useState<EtterlevelseMetadata | undefined>(
    isCreateNew
      ? mapEtterlevelseMetadataToFormValue({
          behandlingId: behandlingId,
          kravVersjon: kravId?.kravVersjon,
          kravNummer: kravId?.kravNummer,
        })
      : undefined,
  )

  useEffect(() => {
    id && !isCreateNew && getEtterlevelseMetadataById(id).then(setData)
  }, [id])

  return [data, setData] as [EtterlevelseMetadata | undefined, (em: EtterlevelseMetadata) => void]
}

export const mapEtterlevelseMetadataToFormValue = (etterlevelsemetaData: Partial<EtterlevelseMetadata>): EtterlevelseMetadata => {
  return {
    id: etterlevelsemetaData.id || '',
    etterlevelseDokumentasjonId: etterlevelsemetaData.etterlevelseDokumentasjonId || '',
    behandlingId: etterlevelsemetaData.behandlingId || '',
    kravNummer: etterlevelsemetaData.kravNummer || 0,
    kravVersjon: etterlevelsemetaData.kravVersjon || 0,
    tildeltMed: etterlevelsemetaData.tildeltMed || [],
    notater: etterlevelsemetaData.notater || '',
    changeStamp: etterlevelsemetaData.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
  }
}
