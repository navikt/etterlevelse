import { ICode } from '@/constants/codelist/constants'
import {
  IBehandling,
  IChangeStamp,
  IDomainObject,
  ITeam,
  ITeamResource,
  IVarslingsadresse,
  IVirkemiddel,
} from '@/constants/common/constants'

export enum EEtterlevelseStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG',
  OPPFYLLES_SENERE = 'OPPFYLLES_SENERE',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  FERDIG_DOKUMENTERT = 'FERDIG_DOKUMENTERT',
  IKKE_RELEVANT_FERDIG_DOKUMENTERT = 'IKKE_RELEVANT_FERDIG_DOKUMENTERT',
}

export enum ESuksesskriterieStatus {
  UNDER_ARBEID = 'UNDER_ARBEID',
  OPPFYLT = 'OPPFYLT',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  IKKE_OPPFYLT = 'IKKE_OPPFYLT',
}

export interface ISuksesskriterie {
  id: number
  navn: string
  beskrivelse?: string
  behovForBegrunnelse: boolean
}

export interface IEtterlevelse extends IDomainObject {
  id: string
  behandlingId: string
  etterlevelseDokumentasjonId: string
  kravNummer: number
  kravVersjon: number
  etterleves: boolean
  statusBegrunnelse: string
  dokumentasjon: string[]
  fristForFerdigstillelse: string
  status: EEtterlevelseStatus
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
  prioritised?: boolean
}

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

export interface ISuksesskriterieBegrunnelse {
  suksesskriterieId: number
  begrunnelse: string
  behovForBegrunnelse: boolean
  suksesskriterieStatus?: ESuksesskriterieStatus
  veiledning: boolean
  veiledningsTekst: string
  veiledningsTekst2: string
}

export type TEtterlevelseQL = IEtterlevelse & {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}
