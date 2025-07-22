import { IDomainObject } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '../etterlevelseDokumentasjonConstants'

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

export interface ISuksesskriterieBegrunnelse {
  suksesskriterieId: number
  begrunnelse: string
  behovForBegrunnelse: boolean
  suksesskriterieStatus?: ESuksesskriterieStatus
  veiledning: boolean
  veiledningsTekst: string
  veiledningsTekst2: string
}

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

export type TEtterlevelseQL = IEtterlevelse & {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}
