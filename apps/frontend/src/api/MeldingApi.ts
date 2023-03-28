import axios from 'axios'
import {env} from '../util/env'
import {AlertType, Melding, MeldingStatus, MeldingType, PageResponse} from '../constants'

export const getAllMelding = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getMeldingPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allMelding: Melding[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allMelding = [...allMelding, ...(await getMeldingPage(currentPage, PAGE_SIZE)).content]
    }
    return allMelding
  }
}

export const getMeldingPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Melding>>(`${env.backendBaseUrl}/melding?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getMelding = async (id: string) => {
  return (await axios.get<Melding>(`${env.backendBaseUrl}/melding/${id}`)).data
}

export const getMeldingByType = async (meldingType: MeldingType) => {
  return (await axios.get<PageResponse<Melding>>(`${env.backendBaseUrl}/melding/type/${meldingType}`)).data
}

export const getMeldingByStatus = async (meldingStatus: MeldingStatus) => {
  return (await axios.get<PageResponse<Melding>>(`${env.backendBaseUrl}/melding/status/${meldingStatus}`)).data
}

export const deleteMelding = async (id: string) => {
  return (await axios.delete<Melding>(`${env.backendBaseUrl}/melding/${id}`)).data
}

export const createMelding = async (melding: Melding) => {
  const dto = MeldingToMeldingDto(melding)
  return (await axios.post<Melding>(`${env.backendBaseUrl}/melding`, dto)).data
}

export const updateMelding = async (melding: Melding) => {
  const dto = MeldingToMeldingDto(melding)
  return (await axios.put<Melding>(`${env.backendBaseUrl}/melding/${melding.id}`, dto)).data
}

function MeldingToMeldingDto(melding: Melding): Melding {
  const dto = {
    ...melding,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapMeldingToFormValue = (melding: Partial<Melding>): Melding => {
  return {
    id: melding.id || '',
    changeStamp: melding.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    meldingStatus: melding.meldingStatus || MeldingStatus.DEACTIVE,
    meldingType: melding.meldingType || MeldingType.FORSIDE,
    melding: melding.melding || '',
    secondaryTittel: melding.secondaryTittel || '',
    secondaryMelding: melding.secondaryMelding || '',
    alertType: melding.alertType || AlertType.WARNING,
  }
}
