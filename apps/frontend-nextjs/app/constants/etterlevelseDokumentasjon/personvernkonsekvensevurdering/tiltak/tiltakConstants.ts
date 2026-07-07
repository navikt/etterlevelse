import { IDomainObject } from '../../../commonConstants'
import { ITeam, ITeamResource } from '../../../teamkatalogen/teamkatalogConstants'

export interface ITiltak extends IDomainObject {
  id: string
  pvkDokumentId: string
  navn: string
  beskrivelse: string
  ansvarlig: ITeamResource
  frist: string
  risikoscenarioIds: string[]
  ansvarligTeam: ITeam
  iverksatt: boolean
  iverksattDato?: string
  iverksettingsKommentar?: string
}

export const tiltakFilterValues = {
  alleTiltak: 'alleTiltak',
  utenAnsvarlig: 'utenAnsvarlig',
  utenFrist: 'utenFrist',
}

export const filterTiltakList = (tiltakList: ITiltak[], filter: string): ITiltak[] => {
  switch (filter) {
    case tiltakFilterValues.utenAnsvarlig:
      return tiltakList.filter(
        (tiltak: ITiltak) =>
          !tiltak.ansvarlig || (!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name)
      )
    case tiltakFilterValues.utenFrist:
      return tiltakList.filter((tiltak: ITiltak) => !tiltak.iverksatt && !tiltak.frist)
    default:
      return tiltakList
  }
}
