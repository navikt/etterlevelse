import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  EPVK,
  EPVO,
  EPvoTilbakemeldingStatus,
  IPageResponse,
  IPvoTilbakemelding,
} from '../constants'
import { env } from '../util/env'

export const getAllPvoTilbakemelding = async () => {
  const pageSize = 100
  const firstPage = await getPvoTilbakemeldingPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allPvoTilbakemelding: IPvoTilbakemelding[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allPvoTilbakemelding = [
        ...allPvoTilbakemelding,
        ...(await getPvoTilbakemeldingPage(currentPage, pageSize)).content,
      ]
    }
  }
}

export const getPvoTilbakemeldingPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IPvoTilbakemelding>>(
      `${env.backendBaseUrl}${EPVO.tilbakemelding}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getPvoTilbakemelding = async (id: string) => {
  return (await axios.get<IPvoTilbakemelding>(`${env.backendBaseUrl}${EPVO.tilbakemelding}/${id}`))
    .data
}

export const getPvkDokumentByPvkDokumentId = async (pvkDokumentId: string) => {
  return (
    await axios.get<IPvoTilbakemelding>(
      `${env.backendBaseUrl}${EPVO.tilbakemelding}${EPVK.pvkDokument}/${pvkDokumentId}`
    )
  ).data
}

export const usePvoTilbakemelding = (pvkDokumentId?: string) => {
  const [data, setData] = useState<IPvoTilbakemelding>(mapPvoTilbakemeldingToFormValue({}))
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    if (pvkDokumentId) {
      ;(async () => {
        await getPvkDokumentByPvkDokumentId(pvkDokumentId).then(async (pvoTilbakemelding) => {
          setData(pvoTilbakemelding)
          setIsLoading(false)
        })
      })()
    }
  }, [pvkDokumentId])

  return [data, setData, isLoading] as [
    IPvoTilbakemelding,
    (e: IPvoTilbakemelding) => void,
    boolean,
  ]
}

export const createPvoTilbakemelding = async (pvoTilbakemelding: IPvoTilbakemelding) => {
  const dto = pvoTilbakemeldingToPvoTilbakemeldingDto(pvoTilbakemelding)
  return (await axios.post<IPvoTilbakemelding>(`${env.backendBaseUrl}${EPVO.tilbakemelding}`, dto))
    .data
}

export const updatePvoTilbakemelding = async (pvoTilbakemelding: IPvoTilbakemelding) => {
  const dto = pvoTilbakemeldingToPvoTilbakemeldingDto(pvoTilbakemelding)
  return (
    await axios.put<IPvoTilbakemelding>(
      `${env.backendBaseUrl}${EPVO.tilbakemelding}/${pvoTilbakemelding.id}`,
      dto
    )
  ).data
}

export const deletePvoTilbakemelding = async (id: string) => {
  return (
    await axios.delete<IPvoTilbakemelding>(`${env.backendBaseUrl}${EPVO.tilbakemelding}/${id}`)
  ).data
}

const pvoTilbakemeldingToPvoTilbakemeldingDto = (pvoTilbakemelding: IPvoTilbakemelding) => {
  const dto = {
    ...pvoTilbakemelding,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapPvoTilbakemeldingToFormValue = (
  pvoTilbakemelding: Partial<IPvoTilbakemelding>
): IPvoTilbakemelding => {
  return {
    id: pvoTilbakemelding.id || '',
    changeStamp: pvoTilbakemelding.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    pvkDokumentId: pvoTilbakemelding.pvkDokumentId || '',
    status: pvoTilbakemelding.status || EPvoTilbakemeldingStatus.UNDERARBEID,
    behandlingensArtOgOmfang: pvoTilbakemelding.behandlingensArtOgOmfang || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    innvolveringAvEksterne: pvoTilbakemelding.innvolveringAvEksterne || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    risikoscenarioEtterTiltakk: pvoTilbakemelding.risikoscenarioEtterTiltakk || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
  }
}
