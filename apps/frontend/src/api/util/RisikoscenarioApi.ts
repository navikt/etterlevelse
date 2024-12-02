import axios from 'axios'
import { env } from 'process'
import { IPageResponse, IRisikoscenario } from '../../constants'

export const getAllRisikoscenario = async () => {
  const pageSize = 100
  const firstPage = await getRiskoscenarioPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allRiskoscenario: IRisikoscenario[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allRiskoscenario = [
        ...allRiskoscenario,
        ...(await getRiskoscenarioPage(currentPage, pageSize)).content,
      ]
    }
    return allRiskoscenario
  }
}

export const getRiskoscenarioPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseUrl}/risikoscenario?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getRisikoscenario = async (id: string) => {
  return (await axios.get<IRisikoscenario>(`${env.backendBaseUrl}/riskoscenario/${id}`)).data
}

export const getRisikoscenarioByPvkDokumentId = async (pvkDokumentId: string) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseURl}/risikoscenario/pvkdokument/${pvkDokumentId}`
    )
  ).data
}

export const getRisikoscenarioByKravnummer = async (kravnummer: string) => {
  return (
    await axios.get<IPageResponse<IRisikoscenario>>(
      `${env.backendBaseURl}/risikoscenario/kravnummer/${kravnummer}`
    )
  ).data
}

export const createRiskoscenario = async (risikoscenario: IRisikoscenario) => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (await axios.post<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario`, dto)).data
}

export const updateRiskoscenario = async (risikoscenario: IRisikoscenario) => {
  const dto = risikoscenarioToRisikoscenarioDto(risikoscenario)
  return (
    await axios.put<IRisikoscenario>(
      `${env.backendBaseUrl}/risikoscenario/${risikoscenario.id}`,
      dto
    )
  ).data
}

export const deleteRisikoscenario = async (id: string) => {
  return (await axios.delete<IRisikoscenario>(`${env.backendBaseUrl}/risikoscenario/${id}`)).data
}

const risikoscenarioToRisikoscenarioDto = (risikoscenario: IRisikoscenario) => {
  const dto = {
    ...risikoscenario,
    relevanteKravNummerList: risikoscenario.relevanteKravNummer.map(
      (kravReference) => kravReference.kravNummer
    ),
  } as any
  delete dto.changeStamp
  delete dto.version
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
  }
}
