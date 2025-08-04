import { TLovCode } from './kodeverk/kodeverkConstants'
import { IVarslingsadresse } from './teamkatalogen/varslingsadresse/varslingsadresseConstants'

export enum EAlertType {
  INFO = 'INFO',
  WARNING = 'WARNING',
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

type TNot<T> = { [key in keyof T]?: never }

export type TOr<T, U> = (T & TNot<U>) | (U & TNot<T>)
