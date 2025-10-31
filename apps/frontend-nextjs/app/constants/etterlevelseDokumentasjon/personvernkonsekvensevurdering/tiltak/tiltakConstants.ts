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
}
