import { IChangeStamp } from '@/constants/commonConstants'

export interface IBehandlingensArtOgOmfang {
  id: string
  changeStamp: IChangeStamp
  version: number
  etterlevelseDokumentId: string

  stemmerPersonkategorier?: boolean
  personkategoriAntallBeskrivelse: string
  tilgangsBeskrivelsePersonopplysningene: string
  lagringsBeskrivelsePersonopplysningene: string
}
