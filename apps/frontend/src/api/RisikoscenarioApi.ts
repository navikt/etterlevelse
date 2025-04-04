import axios from 'axios'
import {
  ERisikoscenarioType,
  IKravRisikoscenarioRelasjon,
  IPageResponse,
  IRisikoscenario,
  ITiltakRisikoscenarioRelasjon,
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

export const getRisikoscenarioPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<IRisikoscenario>> =>
  (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getRisikoscenario = async (id: string): Promise<IRisikoscenario> =>
  (await axios.get<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario/${id}`)).data

export const getRisikoscenarioByPvkDokumentId = async (
  pvkDokumentId: string,
  scenarioType: ERisikoscenarioType
): Promise<IPageResponse<IRisikoscenario>> =>
  (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario/pvkdokument/${pvkDokumentId}/${scenarioType}`
    )
  ).data

export const getRisikoscenarioByKravnummer = async (
  kravnummer: string
): Promise<IPageResponse<IRisikoscenario>> =>
  (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario/kravnummer/${kravnummer}`
    )
  ).data

export const createRisikoscenario = async (
  risikoscenario: IRisikoscenario
): Promise<IRisikoscenario> => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (await axios.post<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario`, dto)).data
}

export const createRisikoscenarioKnyttetTilKrav = async (
  kravnummer: number,
  risikoscenario: IRisikoscenario
): Promise<IRisikoscenario> => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (
    await axios.post<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/krav/${kravnummer}`,
      dto
    )
  ).data
}

export const updateRisikoscenario = async (
  risikoscenario: IRisikoscenario
): Promise<IRisikoscenario> => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${risikoscenario.id}`,
      dto
    )
  ).data
}

export const updateKravForRisikoscenarioer = async (
  request: IKravRisikoscenarioRelasjon
): Promise<IRisikoscenario[]> =>
  (
    await axios.put<IRisikoscenario[]>(
      `${env.backendBaseUrl}/risikoscenario/update/addRelevantKrav`,
      {
        kravnummer: request.kravnummer,
        risikoscenarioIder: request.risikoscenarioIder,
      }
    )
  ).data

export const deleteRisikoscenario = async (id: string): Promise<IRisikoscenario> =>
  (await axios.delete<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario/${id}`)).data

export const fjernKravFraRisikoscenario = async (
  id: string,
  kravnummer: number
): Promise<IRisikoscenario> =>
  (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${id}/removeKrav/${kravnummer}`
    )
  ).data

export const addTiltakToRisikoscenario = async (
  request: ITiltakRisikoscenarioRelasjon
): Promise<IRisikoscenario> =>
  (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/update/addRelevanteTiltak`,
      request
    )
  ).data

export const removeTiltakToRisikoscenario = async (
  risikoscenarioId: string,
  tiltakId: string
): Promise<IRisikoscenario> =>
  (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${risikoscenarioId}/removeTiltak/${tiltakId}`
    )
  ).data

const risikoscenarioToRisikoscenarioDto = (risikoscenario: IRisikoscenario) => {
  const dto = {
    ...risikoscenario,
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.tiltakIds
  delete dto.relevanteKravNummer
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
    ingenTiltak: risikoscenario.ingenTiltak === undefined ? undefined : risikoscenario.ingenTiltak,
    sannsynlighetsNivaaEtterTiltak: risikoscenario.sannsynlighetsNivaaEtterTiltak || 0,
    konsekvensNivaaEtterTiltak: risikoscenario.konsekvensNivaaEtterTiltak || 0,
    nivaaBegrunnelseEtterTiltak: risikoscenario.nivaaBegrunnelseEtterTiltak || '',
    tiltakIds: risikoscenario.tiltakIds || [],
  }
}
