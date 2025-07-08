import { ICode } from '../codelist/constants'
import { IBehandling } from '../common/behandlingskatalogen/constants'
import { ITeam, ITeamResource } from '../common/teamkatalogen/constants'
import { IChangeStamp, IVarslingsadresse, IVirkemiddel } from '../constant'

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
