import { IEtterlevelseDokumentasjon } from '../etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '../etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'

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
  statsBySeksjon: Record<string, IAvdelingDashboardStats>
}

export interface ISeksjonOption {
  id: string
  navn: string
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
    underArbeid: number
    tilBehandlingHosPvo: number
    tilbakemeldingFraPvo: number
    godkjentAvRisikoeier: number
    pvkIWord: number
  }
}
