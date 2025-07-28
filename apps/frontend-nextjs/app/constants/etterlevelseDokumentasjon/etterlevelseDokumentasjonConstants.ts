import { IBehandling } from '../behandlingskatalogen/behandlingskatalogConstants'
import {
  IChangeStamp,
  IVarslingsadresse,
  IVirkemiddel,
  TReplace,
  TVarslingsadresseQL,
} from '../commonConstants'
import { ICode } from '../kodeverk/kodeverkConstants'
import { TKravQL } from '../krav/kravConstants'
import { ITeam, ITeamResource } from '../teamkatalogen/teamkatalogConstants'
import { ERelationType } from './dokumentRelasjon/dokumentRelasjonConstants'
import { IEtterlevelse } from './etterlevelse/etterlevelseConstants'

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

export type TEtterlevelseDokumentasjonQL = TReplace<
  IEtterlevelseDokumentasjon,
  {
    varslingsadresser: TVarslingsadresseQL[]
    etterlevelser?: IEtterlevelse[]
    sistEndretEtterlevelse?: string
    sistEndretDokumentasjon?: string
    sistEndretEtterlevelseAvMeg?: string
    sistEndretDokumentasjonAvMeg?: string
    stats?: IEtterlevelseDokumentasjonStats
  }
>

export interface IEtterlevelseDokumentasjonStats {
  relevantKrav: TKravQL[]
  irrelevantKrav: TKravQL[]
  utgaattKrav: TKravQL[]
  lovStats: ILovStats[]
}

export interface ILovStats {
  lovCode: ICode
  relevantKrav: TKravQL[]
  irrelevantKrav: TKravQL[]
  utgaattKrav: TKravQL[]
}

export interface IEtterlevelseDokumentasjonWithRelation extends TEtterlevelseDokumentasjonQL {
  relationType?: ERelationType
}
