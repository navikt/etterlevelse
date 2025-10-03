import { IDomainObject } from '@/constants/commonConstants'

export interface IBehandlingensLivslop extends IDomainObject {
  id: string
  version: number
  etterlevelseDokumentasjonId: string
  beskrivelse: string
  filer: IBehandlingensLivslopFil[]
}

export interface IBehandlingensLivslopFil {
  filnavn: string
  filtype: string
  fil: string
}
