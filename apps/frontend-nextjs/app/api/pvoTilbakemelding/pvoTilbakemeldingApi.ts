import { IPageResponse } from '@/constants/commonConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { env } from '@/util/env/env'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { getPvkDokument } from '../pvkDokument/pvkDokumentApi'

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
  (
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
        await getPvkDokument(pvkDokumentId).then(async (pvkDokument) => {
          const antallInnsending = pvkDokument.antallInnsendingTilPvo

          await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
            .then(async (pvoTilbakemelding) => {
              const formValuePvo = pvoTilbakemelding

              if (antallInnsending > pvoTilbakemelding.vurderinger.length) {
                formValuePvo.vurderinger.push(
                  createNewPvoVurderning(
                    antallInnsending,
                    pvkDokument.currentEtterlevelseDokumentVersjon
                  )
                )
              }

              setData(mapPvoTilbakemeldingToFormValue(formValuePvo))
            })
            .finally(() => setIsLoading(false))
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
    vurderinger: pvoTilbakemelding.vurderinger.map((vurdering) => ({
      ...vurdering,
      ansvarlig: vurdering.ansvarligData
        ? vurdering.ansvarligData.map((resource) => resource.navIdent)
        : [],
    })),
  } as any
  delete dto.ansvarligData
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapVurderingToFormValue = (vurdering: Partial<IVurdering>): IVurdering => {
  return {
    innsendingId: vurdering.innsendingId || 1,
    etterlevelseDokumentVersjon: vurdering.etterlevelseDokumentVersjon || 1,
    internDiskusjon: vurdering.internDiskusjon || '',
    merknadTilEtterleverEllerRisikoeier: vurdering.merknadTilEtterleverEllerRisikoeier || '',
    sendtAv: vurdering.sendtAv || '',
    sendtDato: vurdering.sendtDato || '',
    ansvarlig: vurdering.ansvarlig || [],
    ansvarligData: vurdering.ansvarligData || [],
    arbeidGarVidere:
      vurdering.arbeidGarVidere === undefined ? undefined : vurdering.arbeidGarVidere,
    behovForForhandskonsultasjon:
      vurdering.behovForForhandskonsultasjon === undefined
        ? undefined
        : vurdering.behovForForhandskonsultasjon,
    arbeidGarVidereBegrunnelse: vurdering.arbeidGarVidereBegrunnelse || '',
    behovForForhandskonsultasjonBegrunnelse:
      vurdering.behovForForhandskonsultasjonBegrunnelse || '',
    pvoVurdering: vurdering.pvoVurdering || '',
    pvoFolgeOppEndringer: vurdering.pvoFolgeOppEndringer || false,
    vilFaPvkIRetur: vurdering.vilFaPvkIRetur || false,

    behandlingenslivslop: {
      sistRedigertAv: vurdering.behandlingenslivslop?.sistRedigertAv || '',
      sistRedigertDato: vurdering.behandlingenslivslop?.sistRedigertDato || '',
      bidragsVurdering: vurdering.behandlingenslivslop?.bidragsVurdering || '',
      internDiskusjon: vurdering.behandlingenslivslop?.internDiskusjon || '',
      tilbakemeldingTilEtterlevere:
        vurdering.behandlingenslivslop?.tilbakemeldingTilEtterlevere || '',
    },
    behandlingensArtOgOmfang: {
      sistRedigertAv: vurdering.behandlingensArtOgOmfang?.sistRedigertAv || '',
      sistRedigertDato: vurdering.behandlingensArtOgOmfang?.sistRedigertDato || '',
      bidragsVurdering: vurdering.behandlingensArtOgOmfang?.bidragsVurdering || '',
      internDiskusjon: vurdering.behandlingensArtOgOmfang?.internDiskusjon || '',
      tilbakemeldingTilEtterlevere:
        vurdering.behandlingensArtOgOmfang?.tilbakemeldingTilEtterlevere || '',
    },
    tilhorendeDokumentasjon: {
      sistRedigertAv: vurdering.tilhorendeDokumentasjon?.sistRedigertAv || '',
      sistRedigertDato: vurdering.tilhorendeDokumentasjon?.sistRedigertDato || '',
      internDiskusjon: vurdering.tilhorendeDokumentasjon?.internDiskusjon || '',

      behandlingskatalogDokumentasjonTilstrekkelig:
        vurdering.tilhorendeDokumentasjon?.behandlingskatalogDokumentasjonTilstrekkelig || '',
      behandlingskatalogDokumentasjonTilbakemelding:
        vurdering.tilhorendeDokumentasjon?.behandlingskatalogDokumentasjonTilbakemelding || '',
      behandlingsInternDiskusjon:
        vurdering.tilhorendeDokumentasjon?.behandlingsInternDiskusjon || '',

      kravDokumentasjonTilstrekkelig:
        vurdering.tilhorendeDokumentasjon?.kravDokumentasjonTilstrekkelig || '',
      kravDokumentasjonTilbakemelding:
        vurdering.tilhorendeDokumentasjon?.kravDokumentasjonTilbakemelding || '',
      kravInternDiskusjon: vurdering.tilhorendeDokumentasjon?.kravInternDiskusjon || '',

      risikovurderingTilstrekkelig:
        vurdering.tilhorendeDokumentasjon?.risikovurderingTilstrekkelig || '',
      risikovurderingTilbakemelding:
        vurdering.tilhorendeDokumentasjon?.risikovurderingTilbakemelding || '',
      risikovurderingInternDiskusjon:
        vurdering.tilhorendeDokumentasjon?.risikovurderingInternDiskusjon || '',
    },

    innvolveringAvEksterne: {
      sistRedigertAv: vurdering.innvolveringAvEksterne?.sistRedigertAv || '',
      sistRedigertDato: vurdering.innvolveringAvEksterne?.sistRedigertDato || '',
      bidragsVurdering: vurdering.innvolveringAvEksterne?.bidragsVurdering || '',
      internDiskusjon: vurdering.innvolveringAvEksterne?.internDiskusjon || '',
      tilbakemeldingTilEtterlevere:
        vurdering.innvolveringAvEksterne?.tilbakemeldingTilEtterlevere || '',
    },
    risikoscenarioEtterTiltakk: {
      sistRedigertAv: vurdering.risikoscenarioEtterTiltakk?.sistRedigertAv || '',
      sistRedigertDato: vurdering.risikoscenarioEtterTiltakk?.sistRedigertDato || '',
      bidragsVurdering: vurdering.risikoscenarioEtterTiltakk?.bidragsVurdering || '',
      internDiskusjon: vurdering.risikoscenarioEtterTiltakk?.internDiskusjon || '',
      tilbakemeldingTilEtterlevere:
        vurdering.risikoscenarioEtterTiltakk?.tilbakemeldingTilEtterlevere || '',
    },
  }
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
    vurderinger: pvoTilbakemelding.vurderinger
      ? pvoTilbakemelding.vurderinger.map(mapVurderingToFormValue)
      : [mapVurderingToFormValue({})],
  }
}
