import { IDomainObject } from '@/constants/commonConstants'

export interface IEtterlevelseMetadata extends IDomainObject {
  id: string
  kravNummer: number
  kravVersjon: number
  etterlevelseDokumentasjonId: string
  behandlingId: string
  tildeltMed?: string[]
  notater?: string
}
