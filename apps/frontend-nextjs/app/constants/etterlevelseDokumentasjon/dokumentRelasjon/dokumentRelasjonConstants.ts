import { IChangeStamp } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '../etterlevelseDokumentasjonConstants'

export enum ERelationType {
  ARVER = 'ARVER',
  BYGGER = 'BYGGER',
  ENGANGSKOPI = 'ENGANGSKOPI',
}
export interface IDocumentRelation {
  id: string
  changeStamp: IChangeStamp
  version: number
  RelationType: ERelationType
  fromDocument: string
  toDocument: string
}
export interface IDocumentRelationWithEtterlevelseDokumetajson extends IDocumentRelation {
  fromDocumentWithData: IEtterlevelseDokumentasjon
  toDocumentWithData: IEtterlevelseDokumentasjon
}
