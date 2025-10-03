import { IPageResponse } from '@/constants/commonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
  IPvkDokumentListItem,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const getAllPvkDokument = async () => {
  const pageSize = 100
  const firstPage = await getPvkDokumentPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allPvkDokument: IPvkDokument[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allPvkDokument = [
        ...allPvkDokument,
        ...(await getPvkDokumentPage(currentPage, pageSize)).content,
      ]
    }
    return allPvkDokument
  }
}

export const getAllPvkDokumentListItem = async () => {
  const pageSize = 100
  const firstPage = await getPvkDokumentListItemPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allPvkDokument: IPvkDokumentListItem[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allPvkDokument = [
        ...allPvkDokument,
        ...(await getPvkDokumentListItemPage(currentPage, pageSize)).content,
      ]
    }
    return allPvkDokument
  }
}

export const getPvkDokumentPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<IPvkDokument>> =>
  (
    await axios.get<IPageResponse<IPvkDokument>>(
      `${env.backendBaseUrl}/pvkdokument?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getPvkDokumentListItemPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<IPvkDokumentListItem>> =>
  (
    await axios.get<IPageResponse<IPvkDokumentListItem>>(
      `${env.backendBaseUrl}/pvkdokument/pvo?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getPvkDokument = async (id: string): Promise<IPvkDokument> =>
  (await axios.get<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${id}`)).data

export const getPvkDokumentByEtterlevelseDokumentId = async (etterlevelseDokumentId: string) =>
  (
    await axios.get<IPvkDokument>(
      `${env.backendBaseUrl}/pvkdokument/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data

export const createPvkDokument = async (pvkDokument: IPvkDokument): Promise<IPvkDokument> => {
  const dto = pvkDokumentToPvkDokumentDto(pvkDokument)
  return (await axios.post<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument`, dto)).data
}

export const updatePvkDokument = async (pvkDokument: IPvkDokument): Promise<IPvkDokument> => {
  const dto = pvkDokumentToPvkDokumentDto(pvkDokument)
  return (await axios.put<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${pvkDokument.id}`, dto))
    .data
}

export const deletePvkDokument = async (id: string): Promise<IPvkDokument> =>
  (await axios.delete<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${id}`)).data

export const usePvkDokument = (pvkDokumentId?: string, etterlevelseDokumentasjonId?: string) => {
  const isCreateNew = pvkDokumentId === 'ny'
  const [data, setData] = useState<IPvkDokument | undefined>(
    isCreateNew ? mapPvkDokumentToFormValue({}) : undefined
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    if (pvkDokumentId && !isCreateNew) {
      ;(async () => {
        await getPvkDokument(pvkDokumentId).then(async (pvkDokument: IPvkDokument) => {
          setData(pvkDokument)
          setIsLoading(false)
        })
      })()
    } else if (etterlevelseDokumentasjonId && isCreateNew) {
      //double check that pvkdokument doesnt not exist
      ;(async () => {
        await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjonId).then(
          async (pvkDokument) => {
            if (pvkDokument) {
              setData(pvkDokument)
            }
            setIsLoading(false)
          }
        )
      })()
    }
  }, [pvkDokumentId])

  return [data, setData, isLoading] as [
    IPvkDokument | undefined,
    (pvkDokument: IPvkDokument) => void,
    boolean,
  ]
}

const pvkDokumentToPvkDokumentDto = (pvkDokument: IPvkDokument) => {
  const dto = {
    ...pvkDokument,
    ytterligereEgenskaper: pvkDokument.ytterligereEgenskaper.map((egenskap) => egenskap.code),
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapPvkDokumentToFormValue = (pvkDokument: Partial<IPvkDokument>): IPvkDokument => {
  return {
    id: pvkDokument.id || '',
    changeStamp: pvkDokument.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    etterlevelseDokumentId: pvkDokument.etterlevelseDokumentId || '',
    status: pvkDokument.status || EPvkDokumentStatus.UNDERARBEID,
    behandlingensLivslopBeskrivelse: pvkDokument.behandlingensLivslopBeskrivelse || '',
    ytterligereEgenskaper: pvkDokument.ytterligereEgenskaper || [],
    skalUtforePvk: pvkDokument.skalUtforePvk === undefined ? undefined : pvkDokument.skalUtforePvk,
    pvkVurderingsBegrunnelse: pvkDokument.pvkVurderingsBegrunnelse || '',
    stemmerPersonkategorier:
      pvkDokument.stemmerPersonkategorier === undefined
        ? undefined
        : pvkDokument.stemmerPersonkategorier,
    personkategoriAntallBeskrivelse: pvkDokument.personkategoriAntallBeskrivelse || '',
    tilgangsBeskrivelsePersonopplysningene:
      pvkDokument.tilgangsBeskrivelsePersonopplysningene || '',
    lagringsBeskrivelsePersonopplysningene:
      pvkDokument.lagringsBeskrivelsePersonopplysningene || '',
    harInvolvertRepresentant:
      pvkDokument.harInvolvertRepresentant === undefined
        ? undefined
        : pvkDokument.harInvolvertRepresentant,
    representantInvolveringsBeskrivelse: pvkDokument.representantInvolveringsBeskrivelse || '',

    harDatabehandlerRepresentantInvolvering:
      pvkDokument.harDatabehandlerRepresentantInvolvering === undefined
        ? undefined
        : pvkDokument.harDatabehandlerRepresentantInvolvering,
    dataBehandlerRepresentantInvolveringBeskrivelse:
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse || '',
    merknadTilPvoEllerRisikoeier: pvkDokument.merknadTilPvoEllerRisikoeier || '',
    merknadTilRisikoeier: pvkDokument.merknadTilRisikoeier || '',
    merknadFraRisikoeier: pvkDokument.merknadFraRisikoeier || '',
    sendtTilPvoDato: pvkDokument.sendtTilPvoDato || '',
    sendtTilPvoAv: pvkDokument.sendtTilPvoAv || '',
    godkjentAvRisikoeierDato: pvkDokument.godkjentAvRisikoeierDato || '',
    godkjentAvRisikoeier: pvkDokument.godkjentAvRisikoeier || '',
  }
}
