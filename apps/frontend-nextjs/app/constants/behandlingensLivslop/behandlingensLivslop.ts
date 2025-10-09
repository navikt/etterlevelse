import { IDomainObject } from '../commonConstants'

export interface IBehandlingensLivslopRequest extends IDomainObject {
  id: string
  etterlevelseDokumentasjonId: string
  beskrivelse: string
  filer: File[]
}
