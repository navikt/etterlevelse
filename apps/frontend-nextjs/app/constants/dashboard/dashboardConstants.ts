import { IBehandling } from '../behandlingskatalogen/behandlingskatalogConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  INomEnhet,
  INomSeksjon,
} from '../etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '../etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ITeam, ITeamResource } from '../teamkatalogen/teamkatalogConstants'

export interface IDokKravStats {
  totalKrav: number
  ferdigDokumentert: number
  underArbeid: number
  ikkePaabegynt: number
  behandlinger: { id: string; navn: string; nummer: number }[]
}

export interface IDokPvkStats {
  antallScenarioer: number
  hoyRisikoScenarioer: number
  hoyRisikoEtterTiltak: number
  ikkeIverksatteTiltak: number
  tiltakFristPassert: number
}

export interface ISeksjonOption {
  id: string
  navn: string
}

export interface ITemaDashboardStats {
  temaCode: string
  temaName: string
  kravTotal: number
  kravUnderArbeid: number
  kravFerdigVurdert: number
  suksesskriterierUnderArbeid: number
  suksesskriterierOppfylt: number
  suksesskriterierIkkeOppfylt: number
  suksesskriterierIkkeRelevant: number
  suksesskriterierIkkePaabegynt: number
  ferdigUtfyltKravSuksesskriterierOppfylt?: number
  ferdigUtfyltKravSuksesskriterierIkkeOppfylt?: number
  ferdigUtfyltKravSuksesskriterierIkkeRelevant?: number
  etterlevelseDokumentCount?: number
}

export interface IKravDashboardStats {
  kravId: string
  kravNavn: string
  kravStatus: string
  kravNummer: number
  kravVersjon: number
  etterlevelseTotal: number
  antallUnderArbeid: number
  antallFerdigVurdert: number
  antallSuksesskriterierUnderArbeid: number
  antallSuksesskriterierOppfylt: number
  antallSuksesskriterierIkkeOppfylt: number
  antallSuksesskriterierIkkeRelevant: number
  antallSuksesskriterierIkkePaabegynt: number
  antallFerdigUtfyltKravSuksesskriterierOppfylt: number
  antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt: number
  antallFerdigUtfyltKravSuksesskriterierIkkeRelevant: number
}

export interface IAvdelingDetailData {
  avdelingId: string
  avdelingNavn: string
  seksjoner: ISeksjonOption[]
  totalStats: IAvdelingDashboardStats
  statsBySeksjon: Map<string, IAvdelingDashboardStats>
  dokumentasjoner: IEtterlevelseDokumentasjon[]
  pvkByDokId: Map<string, IPvkDokument>
  kravStatsByDokId: Map<string, IDokKravStats>
  pvkStatsByDokId: Map<string, IDokPvkStats>
}

export interface IDashboardDetailResponse extends IAvdelingDashboardStats {
  seksjoner: ISeksjonOption[]
  statsBySeksjon: Map<string, IAvdelingDashboardStats>
}

export interface IDashboardTable {
  etterlevelseDokumentasjonId: string
  etterlevelseDokumentasjonTittel: string
  etterlevelseNummer: number
  etterlevelseDokumentVersjon: number
  etterlevelseDokumentasjonStatus: EEtterlevelseDokumentasjonStatus
  teams: string[]
  teamsData?: ITeam[]
  resources: string[]
  resourcesData?: ITeamResource[]
  risikoeiere: string[]
  risikoeiereData?: ITeamResource[]
  behandlinger?: IBehandling[]
  nomAvdelingId?: string
  avdelingNavn?: string
  seksjoner: INomSeksjon[]
  enheter: INomEnhet[]
  behandlerPersonopplysninger: boolean

  antallKrav?: number
  antallOppfyltKrav?: number
  oppfyltKravProsent?: number
  sistOppdatertEtterlevelse: string
  sistGodkjentEtterlevelse?: string

  hasPvkDocumentationStarted: boolean
  pvkVurdering: EPvkVurdering
  pvkStatus: EPvkDokumentStatus
  antallRisikoscenario?: number
  antallHoyRisikoscenario?: number
  antallHoyRisikoEtterTiltak?: number
  antallTiltak?: number
  antallIkkeIverksattTiltak?: number
  antallTiltakFristPassert?: number
  sistOppdatertPvk: string
  sistGodkjentPvk?: string
}

export interface IAvdelingDashboardStats {
  avdelingId: string
  avdelingNavn: string
  dokumenter: {
    total: number
    underArbeid: number
    sendtTilGodkjenning: number
    godkjentAvRisikoeier: number
  }
  suksesskriterier: {
    total: number
    ikkePaabegyntAntall: number
    underArbeidAntall: number
    oppfyltAntall: number
    ikkeOppfyltAntall: number
    ikkeRelevantAntall: number
    ikkePaabegyntProsent: number
    underArbeidProsent: number
    oppfyltProsent: number
    ikkeOppfyltProsent: number
    ikkeRelevantProsent: number
  }
  behovForPvk: {
    totalMedPersonopplysninger: number
    ikkeVurdertBehov: number
    vurdertIkkeBehov: number
    behovIkkePaabegynt: number
  }
  pvk: {
    total: number
    ikkePaabegynt: number
    underArbeid: number
    tilBehandlingHosPvo: number
    tilbakemeldingFraPvo: number
    godkjentAvRisikoeier: number
    pvkIWord: number
  }
}
