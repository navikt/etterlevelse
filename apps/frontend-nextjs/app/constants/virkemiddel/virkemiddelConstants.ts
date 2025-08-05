import { IDomainObject } from '../commonConstants'
import { ICode, IRegelverk } from '../kodeverk/kodeverkConstants'

export interface IVirkemiddel extends IDomainObject {
  id: string
  navn: string
  regelverk: IRegelverk[]
  virkemiddelType?: ICode
  livsSituasjon: string
}
