import { IChangeStamp } from '@/constants/commonConstants'
import { IKravReference } from '@/constants/krav/kravConstants'

export interface IRisikoscenario {
  id: string
  changeStamp: IChangeStamp
  version: number
  pvkDokumentId: string
  navn: string
  beskrivelse: string
  sannsynlighetsNivaa: number
  sannsynlighetsNivaaBegrunnelse: string
  konsekvensNivaa: number
  konsekvensNivaaBegrunnelse: string
  relevanteKravNummer: IKravReference[]
  generelScenario: boolean
  tiltakOppdatert: boolean
  ingenTiltak?: boolean
  sannsynlighetsNivaaEtterTiltak: number
  konsekvensNivaaEtterTiltak: number
  nivaaBegrunnelseEtterTiltak: string
  tiltakIds: string[]
}
