import {Code, LovCode} from './services/Codelist'
import {Group} from './services/User'

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P]
}

type Not<T> = { [key in keyof T]?: never }
export type Or<T, U> = (T & Not<U>) | (U & Not<T>)

export interface UserInfo {
  loggedIn: boolean
  groups: Group[]
  ident?: string
  name?: string
  email?: string
}

export interface PageResponse<T> {
  pageNumber: number
  pageSize: number
  pages: number
  numberOfElements: number
  totalElements: number
  content: T[]
}

export interface ChangeStamp {
  lastModifiedBy: string
  lastModifiedDate: string
  createdDate?: string
}

export interface DomainObject {
  changeStamp: ChangeStamp
  version: number
}

export interface KravPrioritering extends DomainObject {
  id: string

  kravVersjon: number
  kravNummer: number
  prioriteringsId: string
}

export interface KravId {
  id: string
  kravVersjon: number
}

export interface KravVersjon {
  kravNummer: string | number
  kravVersjon: string | number
  kravStatus: string
}

export interface Krav extends DomainObject {
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
  varslingsadresser: Varslingsadresse[]
  rettskilder: string[]
  tagger: string[]
  regelverk: Regelverk[]
  periode: Periode
  avdeling?: Code
  underavdeling?: Code
  relevansFor: Code[]
  status: KravStatus
  suksesskriterier: Suksesskriterie[]
  tema?: string
  nyKravVersjon: boolean
  kravIdRelasjoner: string[]
  aktivertDato: string
}

export interface Virkemiddel extends DomainObject {
  id: string
  navn: string
  regelverk: Regelverk[]
  virkemiddelType?: Code
  livsSituasjon: string
}

export interface EtterlevelseMetadata extends DomainObject {
  id: string
  kravNummer: number
  kravVersjon: number
  etterlevelseDokumentasjonId: string

  behandlingId: string
  tildeltMed?: string[]
  notater?: string
}

export interface Suksesskriterie {
  id: number
  navn: string
  beskrivelse?: string
  behovForBegrunnelse: boolean
}

export interface Regelverk {
  lov: LovCode
  spesifisering?: string
}

export interface Varslingsadresse {
  adresse: string
  type: AdresseType
}

export interface SlackChannel {
  id: string
  name?: string
  numMembers?: number
}

export interface SlackUser {
  id: string
  name?: string
}

export enum AdresseType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}

export interface Etterlevelse extends DomainObject {
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
  suksesskriterieBegrunnelser: SuksesskriterieBegrunnelse[]
}

export type KravEtterlevelseData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  status: KravStatus
  etterlevelseId?: string
  etterleves: boolean
  changeStamp: ChangeStamp
  frist?: string
  varselMelding?: string
  prioriteringsId?: string
  etterlevelseStatus?: EtterlevelseStatus
  suksesskriterier: Suksesskriterie[]
  gammelVersjon?: boolean
  etterlevelseChangeStamp?: ChangeStamp
  isIrrelevant?: boolean
  aktivertDato: string
}

export interface SuksesskriterieBegrunnelse {
  suksesskriterieId: number
  begrunnelse: string
  behovForBegrunnelse: boolean
  suksesskriterieStatus: SuksesskriterieStatus
}

export enum SuksesskriterieStatus {
  UNDER_ARBEID = 'UNDER_ARBEID',
  OPPFYLT = 'OPPFYLT',
  IKKE_RELEVANT = 'IKKE_RELEVANT',
}

export interface Behandling extends BehandlingEtterlevData {
  id: string
  navn: string
  nummer: number
  overordnetFormaal: ExternalCode
  formaal?: string
  avdeling?: ExternalCode
  linjer: ExternalCode[]
  systemer: ExternalCode[]
  teams: string[]
}

export interface BehandlingEtterlevData {
  id: string
  irrelevansFor: Code[]
}

export interface EtterlevelseDokumentasjon {
  id: string
  changeStamp: ChangeStamp
  version: number
  title: string
  behandlingId: string
  virkemiddelId: string
  irrelevansFor: Code[]
  etterlevelseNummer: number
  teams: string[]
  //data field for frontend only
  behandling?: Behandling
  behandlerPersonopplysninger: boolean
  virkemiddel?: Virkemiddel
  knyttetTilVirkemiddel: boolean
}

export interface EtterlevelseDokumentasjonStats {
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
  irrelevantKrav: KravQL[]
  lovStats: LovStatsDok[]
}

export interface LovStatsDok {
  lovCode: Code
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
}

export interface Periode {
  start?: string
  slutt?: string
}

export interface Tilbakemelding {
  id: string
  kravNummer: number
  kravVersjon: number
  type: TilbakemeldingType
  melderIdent: string
  meldinger: TilbakemeldingMelding[]
  status: TilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface TilbakemeldingMelding {
  meldingNr: number
  fraIdent: string
  rolle: TilbakemeldingRolle
  tid: string
  innhold: string

  endretTid?: string
  endretAvIdent?: string
}

export interface Melding extends DomainObject {
  id: string
  melding: string
  secondaryTittel: string
  secondaryMelding: string
  meldingType: MeldingType
  meldingStatus: MeldingStatus
  alertType: AlertType
}

export enum TilbakemeldingMeldingStatus {
  UBESVART = 'UBESVART',
  BESVART = 'BESVART',
  MIDLERTIDLIG_SVAR = 'MIDLERTIDLIG_SVAR',
}

export interface EtterlevelseArkiv extends DomainObject {
  id: string
  behandlingId: string
  etterlevelseDokumentasjonId: string
  status: EtterlevelseArkivStatus
  arkiveringDato: string
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

export const emptyPage = {content: [], numberOfElements: 0, pageNumber: 0, pages: 0, pageSize: 1, totalElements: 0}

export interface TeamResource {
  navIdent: string
  givenName: string
  familyName: string
  fullName: string
  email: string
  resourceType: string
}

export interface Team {
  id: string
  name: string
  description: string
  productAreaId?: string
  slackChannel?: string
  tags: string[]
  members: Member[]
}

export interface ProductArea {
  id: string
  name: string
  description: string
  tags: string[]
  members: Member[]
}

export interface Member {
  name?: string
  email?: string
}

export interface ExternalCode {
  list: string
  code: string
  shortName: string
  description: string
}

export interface Begrep {
  id: string
  navn: string
  beskrivelse: string
}

// export type KravQL = Omit<Krav, 'varslingsadresser'> & {
export type KravQL = Replace<
  Krav,
  {
    etterlevelser: EtterlevelseQL[]
    varslingsadresser: VarslingsadresseQL[]
    begreper: Begrep[]
    kravRelasjoner: Krav[]
  }
>

export type EtterlevelseQL = Etterlevelse & {
  behandling: BehandlingQL
}

export type BehandlingQL = Behandling & {
  teamsData: Team[]
  sistEndretEtterlevelse?: string
}

export type EtterlevelseDokumentasjonQL = EtterlevelseDokumentasjon & {
  etterlevelser?: Etterlevelse[]
  sistEndretEtterlevelse?: string
  stats?: EtterlevelseDokumentasjonStats
  teamsData?: Team[]
}

export type VarslingsadresseQL = Varslingsadresse & {
  slackChannel?: SlackChannel
  slackUser?: SlackUser
}

export interface BehandlingStats {
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
  irrelevantKrav: KravQL[]
  lovStats: LovStats[]
}

export interface LovStats {
  lovCode: Code
  fyltKrav: KravQL[]
  ikkeFyltKrav: KravQL[]
}

export type Replace<T, K> = Omit<T, keyof K> & K
