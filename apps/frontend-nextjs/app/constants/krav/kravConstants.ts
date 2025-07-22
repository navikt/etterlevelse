import {
  IDomainObject,
  IRegelverk,
  IVarslingsadresse,
  IVirkemiddel,
  TReplace,
  TVarslingsadresseQL,
} from '@/constants/commonConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IBegrep } from '../behandlingskatalogen/behandlingskatalogConstants'
import { TEtterlevelseQL } from '../etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'

export enum EKravStatus {
  UTKAST = 'UTKAST',
  AKTIV = 'AKTIV',
  UTGAATT = 'UTGAATT',
}

export interface IKrav extends IDomainObject {
  id: string
  kravNummer: number
  kravVersjon: number
  navn: string
  beskrivelse: string
  hensikt: string
  utdypendeBeskrivelse: string
  versjonEndringer: string
  dokumentasjon: string[]
  implementasjoner: string
  notat?: string
  varselMelding?: string
  prioriteringsId?: number
  begrepIder: string[]
  virkemiddelIder: string[]
  varslingsadresser: IVarslingsadresse[]
  rettskilder: string[]
  tagger: string[]
  regelverk: IRegelverk[]
  avdeling?: ICode
  underavdeling?: ICode
  relevansFor: ICode[]
  status: EKravStatus
  suksesskriterier: ISuksesskriterie[]
  tema?: string
  nyKravVersjon: boolean
  kravIdRelasjoner: string[]
  aktivertDato: string
}

export interface ISuksesskriterie {
  id: number
  navn: string
  beskrivelse?: string
  behovForBegrunnelse: boolean
}

export type TKravQL = TReplace<
  IKrav,
  {
    etterlevelser: TEtterlevelseQL[]
    varslingsadresserQl: TVarslingsadresseQL[]
    begreper: IBegrep[]
    virkemidler: IVirkemiddel[]
    kravRelasjoner: IKrav[]
    prioriteringsId: number
  }
>
