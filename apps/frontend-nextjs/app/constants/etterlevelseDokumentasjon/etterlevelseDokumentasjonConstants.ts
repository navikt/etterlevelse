import { IBehandling } from '../behandlingskatalogen/behandlingskatalogConstants'
import { IChangeStamp, IVarslingsadresse, IVirkemiddel } from '../commonConstants'
import { ICode } from '../kodeverk/kodeverkConstants'
import { ITeam, ITeamResource } from '../teamkatalogen/teamkatalogConstants'

export interface IEtterlevelseDokumentasjon {
  id: string
  changeStamp: IChangeStamp
  version: number
  title: string
  beskrivelse: string
  tilgjengeligForGjenbruk: boolean
  gjenbrukBeskrivelse: string
  behandlingIds: string[]
  virkemiddelId: string
  irrelevansFor: ICode[]
  prioritertKravNummer: string[]
  etterlevelseNummer: number
  teams: string[]
  resources: string[]
  risikoeiere: string[]
  nomAvdelingId?: string
  avdelingNavn?: string
  //data field for frontend only
  teamsData?: ITeam[]
  resourcesData?: ITeamResource[]
  risikoeiereData?: ITeamResource[]
  behandlinger?: IBehandling[]
  behandlerPersonopplysninger: boolean
  virkemiddel?: IVirkemiddel
  knyttetTilVirkemiddel: boolean
  forGjenbruk: boolean
  varslingsadresser: IVarslingsadresse[]
  hasCurrentUserAccess: boolean
  risikovurderinger: string[]
  p360Recno: number
  p360CaseNumber: string
}
