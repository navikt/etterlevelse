import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

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

export const getApprovedTiltakByPvkDokumentIdAndTimestamp = async (
  pvkDokumentId: string,
  timestamp: string
) => {
  return (
    await axios.get<ITiltak[]>(
      `${env.backendBaseUrl}/tiltak/approved/pvkDokument/${pvkDokumentId}/${timestamp}`
    )
  ).data
}

export const useLastApprovedTiltakByPvkDokumentId = (pvkDokument: IPvkDokument) => {
  const [alleTiltak, setAlleTiltak] = useState<ITiltak[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const abortedRef = useRef(false)

  useEffect(() => {
    abortedRef.current = false
    ;(async () => {
      await getApprovedTiltakByPvkDokumentIdAndTimestamp(
        pvkDokument.id,
        pvkDokument.changeStamp.lastModifiedDate
      ).then(async (response: ITiltak[]) => {
        const alleTiltak: ITiltak[] = []

        response.forEach((tiltak) => {
          alleTiltak.push(mapTiltakToFormValue(tiltak))
        })

        setAlleTiltak(alleTiltak)
        setIsLoading(false)
      })
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
