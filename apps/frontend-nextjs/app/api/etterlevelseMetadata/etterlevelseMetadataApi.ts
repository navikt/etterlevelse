import { IPageResponse } from '@/constants/commonConstants'
import { IEtterlevelseMetadata } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseMetadataConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion = async (
  etterlevelseDokumentasjonId: string,
  kravNummer: number,
  kravVersjon: number
) => {
  return (
    await axios.get<IPageResponse<IEtterlevelseMetadata>>(
      `${env.backendBaseUrl}/etterlevelsemetadata/etterlevelseDokumentasjon/${etterlevelseDokumentasjonId}/${kravNummer}/${kravVersjon}`
    )
  ).data
}

export const createEtterlevelseMetadata = async (etterlevelseMetadata: IEtterlevelseMetadata) => {
  const dto = etterlevelseMetadataToEtterlevelseMetadataDto(etterlevelseMetadata)
  return (
    await axios.post<IEtterlevelseMetadata>(`${env.backendBaseUrl}/etterlevelsemetadata`, dto)
  ).data
}

export const updateEtterlevelseMetadata = async (etterlevelseMetadata: IEtterlevelseMetadata) => {
  const dto = etterlevelseMetadataToEtterlevelseMetadataDto(etterlevelseMetadata)
  return (
    await axios.put<IEtterlevelseMetadata>(
      `${env.backendBaseUrl}/etterlevelsemetadata/${etterlevelseMetadata.id}`,
      dto
    )
  ).data
}

function etterlevelseMetadataToEtterlevelseMetadataDto(
  etterlevelseMetadata: IEtterlevelseMetadata
): IEtterlevelseMetadata {
  const dto = {
    ...etterlevelseMetadata,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapEtterlevelseMetadataToFormValue = (
  etterlevelsemetaData: Partial<IEtterlevelseMetadata>
): IEtterlevelseMetadata => {
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
