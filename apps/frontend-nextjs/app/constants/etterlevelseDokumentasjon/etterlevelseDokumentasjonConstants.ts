import { IBehandling } from '../behandlingskatalogen/behandlingskatalogConstants'
import { IChangeStamp, TReplace } from '../commonConstants'
import { ICode } from '../kodeverk/kodeverkConstants'
import { TKravQL } from '../krav/kravConstants'
import { ITeam, ITeamResource } from '../teamkatalogen/teamkatalogConstants'
import {
  IVarslingsadresse,
  TVarslingsadresseQL,
} from '../teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { IEtterlevelse } from './etterlevelse/etterlevelseConstants'

export interface IEtterlevelseDokumentasjon {
  id: string
  changeStamp: IChangeStamp
  version: number
  title: string
  beskrivelse: string
  status: EEtterlevelseDokumentasjonStatus
  meldingEtterlevelerTilRisikoeier?: string
  meldingRisikoeierTilEtterleveler?: string
  tilgjengeligForGjenbruk: boolean
  gjenbrukBeskrivelse: string
  behandlingIds: string[]
  irrelevansFor: ICode[]
  prioritertKravNummer: string[]
  etterlevelseNummer: number
  teams: string[]
  resources: string[]
  risikoeiere: string[]
  nomAvdelingId?: string
  avdelingNavn?: string
  seksjoner: INomSeksjon[]
  //data field for frontend only
  teamsData?: ITeam[]
  resourcesData?: ITeamResource[]
  risikoeiereData?: ITeamResource[]
  behandlinger?: IBehandling[]
  behandlerPersonopplysninger: boolean
  forGjenbruk: boolean
  varslingsadresser: IVarslingsadresse[]
  hasCurrentUserAccess: boolean
  risikovurderinger: string[]
  p360Recno: number
  p360CaseNumber: string
}

export enum EEtterlevelseDokumentasjonStatus {
  UNDER_ARBEID = 'UNDER_ARBEID',
  SENDT_TIL_GODKJENNING_TIL_RISIKOEIER = 'SENDT_TIL_GODKJENNING_TIL_RISIKOEIER',
  GODKJENT_AV_RISIKOEIER = 'GODKJENT_AV_RISIKOEIER',
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

export interface INomSeksjon {
  nomSeksjonId: string
  nomSeksjonName: string
}

export enum EActionMenuRoles {
  Etterleveler = 'Etterleveler',
  EtterlevelerOgRisikoeier = 'EtterlevelerOgRisikoeier',
  Admin = 'Admin',
  Risikoeier = 'Risikoeier',
  Personvernombud = 'Personvernombud',
  Les = 'Les',
}
