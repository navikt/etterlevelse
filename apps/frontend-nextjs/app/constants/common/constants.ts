import { ICode, TLovCode } from '@/constants/codelist/constants'

export enum EMeldingType {
  SYSTEM = 'SYSTEM',
  FORSIDE = 'FORSIDE',
  OM_ETTERLEVELSE = 'OM_ETTERLEVELSE',
}

export enum EMeldingStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export enum EAlertType {
  INFO = 'INFO',
  WARNING = 'WARNING',
}

export enum EAdresseType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}

export interface IBreadCrumbPath {
  href: string
  pathName: string
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

export interface IPageResponse<T> {
  pageNumber: number
  pageSize: number
  pages: number
  numberOfElements: number
  totalElements: number
  content: T[]
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

export interface IVarslingsadresse {
  adresse: string
  type: EAdresseType
}

export interface IRegelverk {
  lov: TLovCode
  spesifisering?: string
}

export interface IBegrep {
  id: string
  navn: string
  beskrivelse: string
}

export interface IVirkemiddel extends IDomainObject {
  id: string
  navn: string
  regelverk: IRegelverk[]
  virkemiddelType?: ICode
  livsSituasjon: string
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

export interface IMember {
  navIdent?: string
  name?: string
  email?: string
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
  policies: IPolicy[]
  dataBehandlerList: IDataBehandler[]
  automatiskBehandling: boolean
  profilering: boolean
}

export interface IExternalCode {
  list: string
  code: string
  shortName: string
  description: string
}

export interface IPolicy {
  behandlingId: string
  id: string
  opplysningsTypeId: string
  opplysningsTypeNavn: string
  personKategorier: IExternalCode[]
  sensitivity: IExternalCode[]
}

export interface IDataBehandler {
  id: string
  navn: string
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

export type TVarslingsadresseQL = IVarslingsadresse & {
  slackChannel?: ISlackChannel
  slackUser?: ISlackUser
}

export type TReplace<T, K> = Omit<T, keyof K> & K

type TNot<T> = { [key in keyof T]?: never }

export type TOr<T, U> = (T & TNot<U>) | (U & TNot<T>)
