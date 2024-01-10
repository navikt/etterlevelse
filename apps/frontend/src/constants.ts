import * as React from 'react'
import { ICode, LovCode } from './services/Codelist'
import { Group } from './services/User'

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P]
}

type Not<T> = { [key in keyof T]?: never }

export type Or<T, U> = (T & Not<U>) | (U & Not<T>)

export type Option = Readonly<{
  id?: string | number
  label?: React.ReactNode
}>

export enum TilbakemeldingMeldingStatus {
  UBESVART = 'UBESVART',
  BESVART = 'BESVART',
  MIDLERTIDLIG_SVAR = 'MIDLERTIDLIG_SVAR',
}

export interface IEtterlevelseArkiv extends IDomainObject {
  id: string
  behandlingId: string
  etterlevelseDokumentasjonId: string
  status: EtterlevelseArkivStatus
  arkiveringDato: string
  arkivertAv: string
  tilArkiveringDato: string
  arkiveringAvbruttDato: string
  webSakNummer: string
}

export enum KRAV_FILTER_TYPE {
  RELEVANTE_KRAV = 'RELEVANTE_KRAV',
  BORTFILTTERTE_KRAV = 'BORTFILTERTE_KRAV',
  UTGAATE_KRAV = 'UTGAATE_KRAV',
}

export enum AlertType {
  INFO = 'INFO',
  WARNING = 'WARNING',
}

export enum MeldingType {
  SYSTEM = 'SYSTEM',
  FORSIDE = 'FORSIDE',
  OM_ETTERLEVELSE = 'OM_ETTERLEVELSE',
}

export enum MeldingStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export enum TilbakemeldingRolle {
  KRAVEIER = 'KRAVEIER',
  MELDER = 'MELDER',
}

export enum TilbakemeldingType {
  GOD = 'GOD',
  UKLAR = 'UKLAR',
  ANNET = 'ANNET',
}

export enum EtterlevelseStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG',
  OPPFYLLES_SENERE = 'OPPFYLLES_SENERE',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  FERDIG_DOKUMENTERT = 'FERDIG_DOKUMENTERT',
  IKKE_RELEVANT_FERDIG_DOKUMENTERT = 'IKKE_RELEVANT_FERDIG_DOKUMENTERT',
}

export enum KravStatus {
  UTKAST = 'UTKAST',
  AKTIV = 'AKTIV',
  UTGAATT = 'UTGAATT',
}

export enum KravListFilter {
  RELEVANS = 'RELEVANS',
  LOVER = 'LOVER',
  TEMAER = 'TEMAER',
  STATUS = 'STATUS',
}

export enum VirkemiddelListFilter {
  VIRKEMIDDELTYPE = 'VIRKEMIDDELTYPE',
  SORTDATE = 'SORTDATE',
}

export enum EtterlevelseArkivStatus {
  TIL_ARKIVERING = 'TIL_ARKIVERING',
  BEHANDLER_ARKIVERING = 'BEHANDLER_ARKIVERING',
  ARKIVERT = 'ARKIVERT',
  IKKE_ARKIVER = 'IKKE_ARKIVER',
  ERROR = 'ERROR',
}

export enum AdresseType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}

export enum SuksesskriterieStatus {
  UNDER_ARBEID = 'UNDER_ARBEID',
  OPPFYLT = 'OPPFYLT',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  IKKE_OPPFYLT = 'IKKE_OPPFYLT',
}
export interface IUserInfo {
  loggedIn: boolean
  groups: Group[]
  ident?: string
  name?: string
  email?: string
}

export interface IPageResponse<T> {
  pageNumber: number
  pageSize: number
  pages: number
  numberOfElements: number
  totalElements: number
  content: T[]
}

export interface IChangeStamp {
  lastModifiedBy: string
  lastModifiedDate: string
  createdDate?: string
}

export interface IDomainObject {
  changeStamp: IChangeStamp
  version: number
}

export interface IKravPrioritering extends IDomainObject {
  id: string

  kravVersjon: number
  kravNummer: number
  prioriteringsId: string
}

export interface IKravId {
  id: string
  kravVersjon: number
}

export interface IKravVersjon {
  kravNummer: string | number
  kravVersjon: string | number
  kravStatus: string
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
  prioriteringsId?: string
  kravPriorityUID?: string
  begrepIder: string[]
  virkemiddelIder: string[]
  varslingsadresser: IVarslingsadresse[]
  rettskilder: string[]
  tagger: string[]
  regelverk: IRegelverk[]
  avdeling?: ICode
  underavdeling?: ICode
  relevansFor: ICode[]
  status: KravStatus
  suksesskriterier: ISuksesskriterie[]
  tema?: string
  nyKravVersjon: boolean
  kravIdRelasjoner: string[]
  aktivertDato: string
}

export interface IVirkemiddel extends IDomainObject {
  id: string
  navn: string
  regelverk: IRegelverk[]
  virkemiddelType?: ICode
  livsSituasjon: string
}

export interface IEtterlevelseMetadata extends IDomainObject {
  id: string
  kravNummer: number
  kravVersjon: number
  etterlevelseDokumentasjonId: string
  behandlingId: string
  tildeltMed?: string[]
  notater?: string
}

export interface ISuksesskriterie {
  id: number
  navn: string
  beskrivelse?: string
  behovForBegrunnelse: boolean
}

export interface IRegelverk {
  lov: LovCode
  spesifisering?: string
}

export interface IVarslingsadresse {
  adresse: string
  type: AdresseType
}

export interface ISlackChannel {
  id: string
  name?: string
  numMembers?: number
}

export interface ISlackUser {
  id: string
  name?: string
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
  status: EtterlevelseStatus
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
}

export type KravEtterlevelseData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  status: KravStatus
  etterlevelseId?: string
  etterleves: boolean
  changeStamp: IChangeStamp
  frist?: string
  varselMelding?: string
  prioriteringsId?: string
  etterlevelseStatus?: EtterlevelseStatus
  suksesskriterier: ISuksesskriterie[]
  gammelVersjon?: boolean
  etterlevelseChangeStamp?: IChangeStamp
  isIrrelevant?: boolean
  aktivertDato: string
}

export interface ISuksesskriterieBegrunnelse {
  suksesskriterieId: number
  begrunnelse: string
  behovForBegrunnelse: boolean
  suksesskriterieStatus?: SuksesskriterieStatus
}

export interface IBehandling {
  id: string
  navn: string
  nummer: number
  overordnetFormaal: IExternalCode
  formaal?: string
  avdeling?: IExternalCode
  linjer: IExternalCode[]
  systemer: IExternalCode[]
  teams: string[]
}

export interface IEtterlevelseDokumentasjon {
  id: string
  changeStamp: IChangeStamp
  version: number
  title: string
  behandlingIds: string[]
  virkemiddelId: string
  irrelevansFor: ICode[]
  etterlevelseNummer: number
  teams: string[]
  //data field for frontend only
  teamsData?: ITeam[]
  behandlinger?: IBehandling[]
  behandlerPersonopplysninger: boolean
  virkemiddel?: IVirkemiddel
  knyttetTilVirkemiddel: boolean
  knytteTilTeam: boolean
}

export interface IEtterlevelseDokumentasjonStats {
  relevantKrav: KravQL[]
  irrelevantKrav: KravQL[]
  utgaattKrav: KravQL[]
  lovStats: ILovStats[]
}

export interface ILovStats {
  lovCode: ICode
  relevantKrav: KravQL[]
  irrelevantKrav: KravQL[]
  utgaattKrav: KravQL[]
}

export interface ITilbakemelding {
  id: string
  kravNummer: number
  kravVersjon: number
  type: TilbakemeldingType
  melderIdent: string
  meldinger: ITilbakemeldingMelding[]
  status: TilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface ITilbakemeldingMelding {
  meldingNr: number
  fraIdent: string
  rolle: TilbakemeldingRolle
  tid: string
  innhold: string
  endretTid?: string
  endretAvIdent?: string
}

export interface IMelding extends IDomainObject {
  id: string
  melding: string
  secondaryTittel: string
  secondaryMelding: string
  meldingType: MeldingType
  meldingStatus: MeldingStatus
  alertType: AlertType
}

export const emptyPage = { content: [], numberOfElements: 0, pageNumber: 0, pages: 0, pageSize: 1, totalElements: 0 }

export interface ITeamResource {
  navIdent: string
  givenName: string
  familyName: string
  fullName: string
  email: string
  resourceType: string
}

export interface ITeam {
  id: string
  name: string
  description: string
  productAreaId?: string
  productAreaName?: string
  slackChannel?: string
  tags: string[]
  members: IMember[]
}

export interface IProductArea {
  id: string
  name: string
  description: string
  tags: string[]
  members: IMember[]
}

export interface IMember {
  name?: string
  email?: string
}

export interface IExternalCode {
  list: string
  code: string
  shortName: string
  description: string
}

export interface IBegrep {
  id: string
  navn: string
  beskrivelse: string
}

export type KravQL = Replace<
  IKrav,
  {
    etterlevelser: EtterlevelseQL[]
    varslingsadresser: VarslingsadresseQL[]
    begreper: IBegrep[]
    virkemidler: IVirkemiddel[]
    kravRelasjoner: IKrav[]
    prioriteringsId: string
  }
>

export type EtterlevelseQL = IEtterlevelse & {
  etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL
}

export type BehandlingQL = IBehandling & {
  teamsData: ITeam[]
}

export type EtterlevelseDokumentasjonQL = IEtterlevelseDokumentasjon & {
  etterlevelser?: IEtterlevelse[]
  sistEndretEtterlevelse?: string
  sistEndretDokumentasjon?: string
  stats?: IEtterlevelseDokumentasjonStats
}

export type VarslingsadresseQL = IVarslingsadresse & {
  slackChannel?: ISlackChannel
  slackUser?: ISlackUser
} 
export type Replace<T, K> = Omit<T, keyof K> & K
