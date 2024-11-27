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
