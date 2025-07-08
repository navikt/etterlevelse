import { ICode } from '@/constants/codelist/constants'
import {
  IDomainObject,
  IRegelverk,
  ISuksesskriterie,
  IVarslingsadresse,
} from '@/constants/constant'

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
