import {Code} from './services/Codelist'

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export interface UserInfo {
  loggedIn: boolean;
  groups: string[];
  ident?: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
}

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  content: T[];
}

export interface ChangeStamp {
  lastModifiedBy: string;
  lastModifiedDate: string;
}

export interface Krav {
  id: string
  changeStamp: ChangeStamp
  version: number

  kravNummer: number
  kravVersjon: number
  navn: string
  beskrivelse: string
  hensikt: string
  utdypendeBeskrivelse: string
  dokumentasjon: string[]
  implementasjoner: string[]
  begreper: string[]
  kontaktPersoner: string[]
  rettskilder: string[]
  tagger: string[]
  periode?: Periode
  avdeling: string
  underavdeling: string
  relevansFor?: Code
  status: KravStatus
}

export interface Periode {
  start: string
  slutt: string
  isActive: boolean
}

export enum KravStatus {
  UNDER_REDIGERING = 'UNDER_REDIGERING',
  FERDIG = 'FERDIG'
}

export const emptyPage = {content: [], numberOfElements: 0, pageNumber: 0, pages: 0, pageSize: 1, totalElements: 0}
