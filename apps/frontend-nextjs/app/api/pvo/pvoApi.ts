import { IPageResponse } from '@/constants/commonConstants'
import { EPvoTilbakemeldingStatus, IPvoTilbakemelding } from '@/constants/pvo/pvoConstants'
import axios from 'axios'
import { env } from 'process'
import { useEffect, useState } from 'react'

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
    return allPvoTilbakemelding
  }
}

export const getPvoTilbakemeldingPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<IPvoTilbakemelding>> =>
  (
    await axios.get<IPageResponse<IPvoTilbakemelding>>(
      `${env.backendBaseUrl}/pvotilbakemelding?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getPvoTilbakemelding = async (id: string): Promise<IPvoTilbakemelding> =>
  (await axios.get<IPvoTilbakemelding>(`${env.backendBaseUrl}/pvotilbakemelding/${id}`)).data

export const getPvoTilbakemeldingByPvkDokumentId = async (
  pvkDokumentId: string
): Promise<IPvoTilbakemelding> =>
  pvo(
    await axios.get<IPvoTilbakemelding>(
      `${env.backendBaseUrl}/pvotilbakemelding/pvkdokument/${pvkDokumentId}`
    )
  ).data

export const usePvoTilbakemelding = (pvkDokumentId?: string) => {
  const [data, setData] = useState<IPvoTilbakemelding>(mapPvoTilbakemeldingToFormValue({}))
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    if (pvkDokumentId) {
      ;(async () => {
        await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId).then(async (pvoTilbakemelding) => {
          setData(mapPvoTilbakemeldingToFormValue(pvoTilbakemelding))
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
  return (await axios.post<IPvoTilbakemelding>(`${env.backendBaseUrl}/pvotilbakemelding`, dto)).data
}

export const updatePvoTilbakemelding = async (pvoTilbakemelding: IPvoTilbakemelding) => {
  const dto = pvoTilbakemeldingToPvoTilbakemeldingDto(pvoTilbakemelding)
  return (
    await axios.put<IPvoTilbakemelding>(
      `${env.backendBaseUrl}/pvotilbakemelding/${pvoTilbakemelding.id}`,
      dto
    )
  ).data
}

export const deletePvoTilbakemelding = async (id: string) => {
  return (await axios.delete<IPvoTilbakemelding>(`${env.backendBaseUrl}/pvotilbakemelding/${id}`))
    .data
}

const pvoTilbakemeldingToPvoTilbakemeldingDto = (pvoTilbakemelding: IPvoTilbakemelding) => {
  const dto = {
    ...pvoTilbakemelding,
    ansvarlig: pvoTilbakemelding.ansvarligData
      ? pvoTilbakemelding.ansvarligData.map((resource) => resource.navIdent)
      : [],
  } as any
  delete dto.ansvarligData
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
    status: pvoTilbakemelding.status || EPvoTilbakemeldingStatus.IKKE_PABEGYNT,
    merknadTilEtterleverEllerRisikoeier:
      pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier || '',
    sendtDato: pvoTilbakemelding.sendtDato || '',
    ansvarlig: pvoTilbakemelding.ansvarlig || [],
    ansvarligData: pvoTilbakemelding.ansvarligData || [],
    arbeidGarVidere: pvoTilbakemelding.arbeidGarVidere,
    behovForForhandskonsultasjon: pvoTilbakemelding.behovForForhandskonsultasjon,
    arbeidGarVidereBegrunnelse: pvoTilbakemelding.arbeidGarVidereBegrunnelse || '',
    behovForForhandskonsultasjonBegrunnelse:
      pvoTilbakemelding.behovForForhandskonsultasjonBegrunnelse || '',
    pvoVurdering: pvoTilbakemelding.pvoVurdering || '',
    pvoFolgeOppEndringer: pvoTilbakemelding.pvoFolgeOppEndringer || false,
    vilFaPvkIRetur: pvoTilbakemelding.vilFaPvkIRetur || false,
    behandlingenslivslop: pvoTilbakemelding.behandlingenslivslop || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    behandlingensArtOgOmfang: pvoTilbakemelding.behandlingensArtOgOmfang || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    tilhorendeDokumentasjon: pvoTilbakemelding.tilhorendeDokumentasjon || {
      sistRedigertAv: '',
      sistRedigertDato: '',
      internDiskusjon: '',
      behandlingskatalogDokumentasjonTilstrekkelig: '',
      behandlingskatalogDokumentasjonTilbakemelding: '',
      kravDokumentasjonTilstrekkelig: '',
      kravDokumentasjonTilbakemelding: '',
      risikovurderingTilstrekkelig: '',
      risikovurderingTilbakemelding: '',
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
