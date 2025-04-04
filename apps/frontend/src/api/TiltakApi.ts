import axios from 'axios'
import { IPageResponse, ITeamResource, ITiltak } from '../constants'
import { env } from '../util/env'

export const getAllTiltak = async (): Promise<ITiltak[]> => {
  const pageSize = 100
  const firstPage = await getTiltakPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allTiltak: ITiltak[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allTiltak = [...allTiltak, ...(await getTiltakPage(currentPage, pageSize)).content]
    }
    return allTiltak
  }
}

export const getTiltakPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<ITiltak>> =>
  (
    await axios.get<IPageResponse<ITiltak>>(
      `${env.backendBaseUrl}/tiltak?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getTiltak = async (id: string): Promise<ITiltak> =>
  (await axios.get<ITiltak>(`${env.backendBaseUrl}/tiltak/${id}`)).data

export const getTiltakByPvkDokumentId = async (
  pvkDokumentId: string
): Promise<IPageResponse<ITiltak>> =>
  (
    await axios.get<IPageResponse<ITiltak>>(
      `${env.backendBaseUrl}/tiltak/pvkdokument/${pvkDokumentId}`
    )
  ).data

export const createTiltakAndRelasjonWithRisikoscenario = async (
  tiltak: ITiltak,
  risikoscenarioId: string
): Promise<ITiltak> => {
  const dto = tiltakTotiltakDto(tiltak)
  return (
    await axios.post<ITiltak>(
      `${env.backendBaseUrl}/tiltak/risikoscenario/${risikoscenarioId}`,
      dto
    )
  ).data
}

export const updateTiltak = async (tiltak: ITiltak): Promise<ITiltak> => {
  const dto = tiltakTotiltakDto(tiltak)
  return (await axios.put<ITiltak>(`${env.backendBaseUrl}/tiltak/${tiltak.id}`, dto)).data
}

export const deleteTiltak = async (id: string): Promise<ITiltak> =>
  (await axios.delete<ITiltak>(`${env.backendBaseUrl}/tiltak/${id}`)).data

const tiltakTotiltakDto = (tiltak: ITiltak) => {
  const dto = {
    ...tiltak,
    ansvarlig: tiltak.ansvarlig.navIdent || '',
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.risikoscenarioIds
  return dto
}

export const mapTiltakToFormValue = (tiltak: Partial<ITiltak>): ITiltak => {
  return {
    id: tiltak.id || '',
    changeStamp: tiltak.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    pvkDokumentId: tiltak.pvkDokumentId || '',
    navn: tiltak.navn || '',
    beskrivelse: tiltak.beskrivelse || '',
    ansvarlig: tiltak.ansvarlig || ({} as ITeamResource),
    frist: tiltak.frist || '',
    risikoscenarioIds: tiltak.risikoscenarioIds || [],
  }
}
