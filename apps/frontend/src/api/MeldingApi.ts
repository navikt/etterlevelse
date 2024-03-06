import axios from 'axios'
import { EAlertType, EMeldingStatus, EMeldingType, IMelding, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAllMelding = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getMeldingPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allMelding: IMelding[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allMelding = [...allMelding, ...(await getMeldingPage(currentPage, PAGE_SIZE)).content]
    }
    return allMelding
  }
}

export const getMeldingPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IMelding>>(
      `${env.backendBaseUrl}/melding?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getMelding = async (id: string) => {
  return (await axios.get<IMelding>(`${env.backendBaseUrl}/melding/${id}`)).data
}

export const getMeldingByType = async (meldingType: EMeldingType) => {
  return (
    await axios.get<IPageResponse<IMelding>>(`${env.backendBaseUrl}/melding/type/${meldingType}`)
  ).data
}

export const getMeldingByStatus = async (meldingStatus: EMeldingStatus) => {
  return (
    await axios.get<IPageResponse<IMelding>>(
      `${env.backendBaseUrl}/melding/status/${meldingStatus}`
    )
  ).data
}

export const deleteMelding = async (id: string) => {
  return (await axios.delete<IMelding>(`${env.backendBaseUrl}/melding/${id}`)).data
}

export const createMelding = async (melding: IMelding) => {
  const dto = MeldingToMeldingDto(melding)
  return (await axios.post<IMelding>(`${env.backendBaseUrl}/melding`, dto)).data
}

export const updateMelding = async (melding: IMelding) => {
  const dto = MeldingToMeldingDto(melding)
  return (await axios.put<IMelding>(`${env.backendBaseUrl}/melding/${melding.id}`, dto)).data
}

function MeldingToMeldingDto(melding: IMelding): IMelding {
  const dto = {
    ...melding,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapMeldingToFormValue = (melding: Partial<IMelding>): IMelding => {
  return {
    id: melding.id || '',
    changeStamp: melding.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    meldingStatus: melding.meldingStatus || EMeldingStatus.DEACTIVE,
    meldingType: melding.meldingType || EMeldingType.FORSIDE,
    melding: melding.melding || '',
    secondaryTittel: melding.secondaryTittel || '',
    secondaryMelding: melding.secondaryMelding || '',
    alertType: melding.alertType || EAlertType.WARNING,
  }
}
