import * as React from 'react'
import { ICode, TLovCode } from './services/Codelist'
import { EGroup } from './services/User'

export type TRecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? TRecursivePartial<U>[]
    : T[P] extends object
      ? TRecursivePartial<T[P]>
      : T[P]
}

type TNot<T> = { [key in keyof T]?: never }

export type TOr<T, U> = (T & TNot<U>) | (U & TNot<T>)

export type TOption = Readonly<{
  value?: string | number
  label?: React.ReactNode
}>

export enum ETilbakemeldingMeldingStatus {
  UBESVART = 'UBESVART',
  BESVART = 'BESVART',
  MIDLERTIDLIG_SVAR = 'MIDLERTIDLIG_SVAR',
}

export enum EYupErrorMessage {
  PAAKREVD = 'Feltet er påkrevd',
}

export interface IEtterlevelseArkiv extends IDomainObject {
  id: string
  behandlingId: string
  etterlevelseDokumentasjonId: string
  status: EEtterlevelseArkivStatus
  arkiveringDato: string
  arkivertAv: string
  tilArkiveringDato: string
  arkiveringAvbruttDato: string
  webSakNummer: string
  onlyActiveKrav: boolean
}

export enum EKravFilterType {
  RELEVANTE_KRAV = 'RELEVANTE_KRAV',
  BORTFILTTERTE_KRAV = 'BORTFILTERTE_KRAV',
  UTGAATE_KRAV = 'UTGAATE_KRAV',
}

export type TKravFilters = {
  relevans?: string[]
  nummer?: number
  etterlevelseDokumentasjonId?: string
  underavdeling?: string
  lov?: string
  status?: string[]
  lover?: string[]
  gjeldendeKrav?: boolean
  sistRedigert?: number
  pageNumber?: number
  pageSize?: number
}

export enum EAlertType {
  INFO = 'INFO',
  WARNING = 'WARNING',
}

export enum EMeldingType {
  SYSTEM = 'SYSTEM',
  FORSIDE = 'FORSIDE',
  OM_ETTERLEVELSE = 'OM_ETTERLEVELSE',
}

export enum EMeldingStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export enum ETilbakemeldingRolle {
  KRAVEIER = 'KRAVEIER',
  MELDER = 'MELDER',
}

export enum ETilbakemeldingType {
  GOD = 'GOD',
  UKLAR = 'UKLAR',
  ANNET = 'ANNET',
}

export enum EEtterlevelseStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG',
  OPPFYLLES_SENERE = 'OPPFYLLES_SENERE',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  FERDIG_DOKUMENTERT = 'FERDIG_DOKUMENTERT',
  IKKE_RELEVANT_FERDIG_DOKUMENTERT = 'IKKE_RELEVANT_FERDIG_DOKUMENTERT',
}

export enum EKravStatus {
  UTKAST = 'UTKAST',
  AKTIV = 'AKTIV',
  UTGAATT = 'UTGAATT',
}

export enum EKravListFilter {
  RELEVANS = 'RELEVANS',
  LOVER = 'LOVER',
  TEMAER = 'TEMAER',
  STATUS = 'STATUS',
}

export enum EVirkemiddelListFilter {
  VIRKEMIDDELTYPE = 'VIRKEMIDDELTYPE',
  SORTDATE = 'SORTDATE',
}

export enum EEtterlevelseArkivStatus {
  TIL_ARKIVERING = 'TIL_ARKIVERING',
  BEHANDLER_ARKIVERING = 'BEHANDLER_ARKIVERING',
  ARKIVERT = 'ARKIVERT',
  IKKE_ARKIVER = 'IKKE_ARKIVER',
  ERROR = 'ERROR',
}

export enum EAdresseType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}

export enum ESuksesskriterieStatus {
  UNDER_ARBEID = 'UNDER_ARBEID',
  OPPFYLT = 'OPPFYLT',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
  IKKE_OPPFYLT = 'IKKE_OPPFYLT',
}
export interface IUserInfo {
  loggedIn: boolean
  groups: EGroup[]
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

export interface IKravPriorityList extends IDomainObject {
  id: string
  temaId: string
  priorityList: number[]
}

export interface IBreadCrumbPath {
  href: string
  pathName: string
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
  lov: TLovCode
  spesifisering?: string
}

export interface IVarslingsadresse {
  adresse: string
  type: EAdresseType
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
  status: EEtterlevelseStatus
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[]
}

export type TKravEtterlevelseData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  status: EKravStatus
  etterlevelseId?: string
  etterleves: boolean
  changeStamp: IChangeStamp
  frist?: string
  varselMelding?: string
  prioriteringsId?: number
  etterlevelseStatus?: EEtterlevelseStatus
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
  suksesskriterieStatus?: ESuksesskriterieStatus
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
  avdeling?: ICode
  //data field for frontend only
  teamsData?: ITeam[]
  behandlinger?: IBehandling[]
  behandlerPersonopplysninger: boolean
  virkemiddel?: IVirkemiddel
  knyttetTilVirkemiddel: boolean
  knytteTilTeam: boolean
}

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

export interface ITilbakemelding {
  id: string
  kravNummer: number
  kravVersjon: number
  type: ETilbakemeldingType
  melderIdent: string
  meldinger: ITilbakemeldingMelding[]
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface ITilbakemeldingMelding {
  meldingNr: number
  fraIdent: string
  rolle: ETilbakemeldingRolle
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
  meldingType: EMeldingType
  meldingStatus: EMeldingStatus
  alertType: EAlertType
}

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

export type TKravQL = TReplace<
  IKrav,
  {
    etterlevelser: TEtterlevelseQL[]
    varslingsadresser: TVarslingsadresseQL[]
    begreper: IBegrep[]
    virkemidler: IVirkemiddel[]
    kravRelasjoner: IKrav[]
    prioriteringsId: number
  }
>

export type TEtterlevelseQL = IEtterlevelse & {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export type TEtterlevelseDokumentasjonQL = IEtterlevelseDokumentasjon & {
  etterlevelser?: IEtterlevelse[]
  sistEndretEtterlevelse?: string
  sistEndretDokumentasjon?: string
  stats?: IEtterlevelseDokumentasjonStats
}

export type TVarslingsadresseQL = IVarslingsadresse & {
  slackChannel?: ISlackChannel
  slackUser?: ISlackUser
}
export type TReplace<T, K> = Omit<T, keyof K> & K
