import { ICode, TLovCode } from './kodeverk/kodeverkConstants'

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

export interface IVarslingsadresse {
  adresse: string
  type: EAdresseType
}

export type TReplace<T, K> = Omit<T, keyof K> & K

export interface IRegelverk {
  lov: TLovCode
  spesifisering?: string
}

export interface IPageResponse<T> {
  pageNumber: number
  pageSize: number
  pages: number
  numberOfElements: number
  totalElements: number
  content: T[]
}

export interface ISuksesskriterie {
  id: number
  navn: string
  beskrivelse?: string
  behovForBegrunnelse: boolean
}

export interface IVirkemiddel extends IDomainObject {
  id: string
  navn: string
  regelverk: IRegelverk[]
  virkemiddelType?: ICode
  livsSituasjon: string
}
