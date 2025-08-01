import { IDomainObject, IRegelverk } from '../commonConstants'
import { ICode } from '../kodeverk/kodeverkConstants'

export interface IVirkemiddel extends IDomainObject {
  id: string
  navn: string
  regelverk: IRegelverk[]
  virkemiddelType?: ICode
  livsSituasjon: string
}
