import { TOption } from '@/constants/commonConstants'

export enum EKravListFilter {
  RELEVANS = 'RELEVANS',
  LOVER = 'LOVER',
  TEMAER = 'TEMAER',
  STATUS = 'STATUS',
}

export enum ETab {
  SISTE = 'siste',
  ALLE = 'alle',
  TEMA = 'tema',
}

export type TKravFilter = {
  status: TOption[]
  relevans: TOption[]
  tema: TOption[]
  lover: TOption[]
}
