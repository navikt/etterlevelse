import { IChangeStamp, IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { getAuditByTableIdAndTimeStamp } from '../audit/auditApi'

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
    ansvarligTeam: tiltak.ansvarligTeam.id || '',
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.risikoscenarioIds
  return dto
}

export const useLastApprovedTiltakByPvkDokumentId = (pvkDokument: IPvkDokument) => {
  const [alleTiltak, setAlleTiltak] = useState<ITiltak[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const abortedRef = useRef(false)

  useEffect(() => {
    abortedRef.current = false
    ;(async () => {
      await getTiltakByPvkDokumentId(pvkDokument.id).then(
        async (response: IPageResponse<ITiltak>) => {
          const sistGodkjentTiltak = response.content.filter((tiltak: ITiltak) =>
            moment(tiltak.changeStamp.createdDate).isBefore(pvkDokument.godkjentAvRisikoeierDato)
          )

          const alleSisGodkjentTiltak: ITiltak[] = []

          await Promise.all(
            sistGodkjentTiltak.map(async (tiltak: ITiltak) => {
              const auditData = await getAuditByTableIdAndTimeStamp(
                tiltak.id,
                pvkDokument.godkjentAvRisikoeierDato
              )
              if (auditData.length !== 0) {
                const tiltakUpperAuditData = auditData[0].data as ITiltak
                const timeStampData = auditData[0].data as IChangeStamp
                const previousData = (auditData[0].data as { tiltakData: ITiltak }).tiltakData

                alleSisGodkjentTiltak.push(
                  mapTiltakToFormValue({
                    ...tiltakUpperAuditData,
                    ...previousData,
                    changeStamp: {
                      lastModifiedBy: timeStampData.lastModifiedBy,
                      lastModifiedDate: timeStampData.lastModifiedDate,
                    },
                  })
                )
              }
            })
          )

          setAlleTiltak(alleSisGodkjentTiltak)
          setIsLoading(false)
        }
      )
    })()

    return () => {
      abortedRef.current = true
    }
  }, [pvkDokument])

  return [alleTiltak, isLoading] as [ITiltak[], boolean]
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
    ansvarligTeam: tiltak.ansvarligTeam || ({} as ITeam),
    iverksatt: tiltak.iverksatt === undefined ? false : tiltak.iverksatt,
    iverksattDato: tiltak.iverksattDato === undefined ? undefined : tiltak.iverksattDato,
    iverksettingsKommentar: tiltak.iverksettingsKommentar || '',
  }
}
