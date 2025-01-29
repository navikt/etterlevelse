import axios from 'axios'
import {
  ERisikoscenarioType,
  IKravRisikoscenarioRelasjon,
  IPageResponse,
  IRisikoscenario,
} from '../constants'
import { env } from '../util/env'

export const getAllRisikoscenario = async () => {
  const pageSize = 100
  const firstPage = await getRisikoscenarioPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allRisikoscenario: IRisikoscenario[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allRisikoscenario = [
        ...allRisikoscenario,
        ...(await getRisikoscenarioPage(currentPage, pageSize)).content,
      ]
    }
    return allRisikoscenario
  }
}

export const getRisikoscenarioPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getRisikoscenario = async (id: string) => {
  return (await axios.get<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario/${id}`)).data
}

export const getRisikoscenarioByPvkDokumentId = async (
  pvkDokumentId: string,
  scenarioType: ERisikoscenarioType
) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario/pvkdokument/${pvkDokumentId}/${scenarioType}`
    )
  ).data
}

export const getRisikoscenarioByKravnummer = async (kravnummer: string) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario/kravnummer/${kravnummer}`
    )
  ).data
}

export const createRisikoscenario = async (risikoscenario: IRisikoscenario) => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (await axios.post<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario`, dto)).data
}

export const updateRisikoscenario = async (risikoscenario: IRisikoscenario) => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${risikoscenario.id}`,
      dto
    )
  ).data
}

export const updateKravForRisikoscenarioer = async (request: IKravRisikoscenarioRelasjon) => {
  return (
    await axios.put<IRisikoscenario[]>(`${env.backendBaseUrl}/risikoscenario/update/relevantKrav`, {
      kravnummer: request.kravnummer,
      risikoscenarioIder: request.risikoscenarioIder,
    })
  ).data
}

export const deleteRisikoscenario = async (id: string) => {
  return (await axios.delete<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario/${id}`)).data
}

export const fjernKravFraRisikoscenario = async (id: string, kravnummer: number) => {
  return (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${id}/removeKrav/${kravnummer}`
    )
  ).data
}

const risikoscenarioToRisikoscenarioDto = (risikoscenario: IRisikoscenario) => {
  const dto = {
    ...risikoscenario,
    relevanteKravNummer: risikoscenario.relevanteKravNummer.map(
      (kravReference) => kravReference.kravNummer
    ),
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.tiltakIds
  return dto
}

export const mapRisikoscenarioToFormValue = (
  risikoscenario: Partial<IRisikoscenario>
): IRisikoscenario => {
  return {
    id: risikoscenario.id || '',
    changeStamp: risikoscenario.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    pvkDokumentId: risikoscenario.pvkDokumentId || '',
    navn: risikoscenario.navn || '',
    beskrivelse: risikoscenario.beskrivelse || '',
    sannsynlighetsNivaa: risikoscenario.sannsynlighetsNivaa || 0,
    sannsynlighetsNivaaBegrunnelse: risikoscenario.sannsynlighetsNivaaBegrunnelse || '',
    konsekvensNivaa: risikoscenario.konsekvensNivaa || 0,
    konsekvensNivaaBegrunnelse: risikoscenario.konsekvensNivaaBegrunnelse || '',
    relevanteKravNummer: risikoscenario.relevanteKravNummer || [],
    generelScenario: risikoscenario.generelScenario || false,
    kravToAdd: [],
    kravToDelete: [],
    ingenTiltak: risikoscenario.ingenTiltak === undefined ? undefined : risikoscenario.ingenTiltak,
    sannsynlighetsNivaaEtterTiltak: risikoscenario.sannsynlighetsNivaaEtterTiltak || 0,
    konsekvensNivaaEtterTiltak: risikoscenario.konsekvensNivaaEtterTiltak || 0,
    nivaaBegrunnelseEtterTiltak: risikoscenario.nivaaBegrunnelseEtterTiltak || '',
    tiltakIds: risikoscenario.tiltakIds || [],
  }
}
