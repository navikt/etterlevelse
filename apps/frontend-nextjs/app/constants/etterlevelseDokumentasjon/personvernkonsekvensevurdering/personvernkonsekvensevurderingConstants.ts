import { IChangeStamp } from '@/constants/commonConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'

export interface IPvkDokument {
  id: string
  changeStamp: IChangeStamp
  version: number
  etterlevelseDokumentId: string
  status: EPvkDokumentStatus
  behandlingensLivslopBeskrivelse: string
  ytterligereEgenskaper: ICode[]
  skalUtforePvk?: boolean
  pvkVurderingsBegrunnelse: string

  stemmerPersonkategorier?: boolean
  personkategoriAntallBeskrivelse: string
  tilgangsBeskrivelsePersonopplysningene: string
  lagringsBeskrivelsePersonopplysningene: string

  harInvolvertRepresentant?: boolean
  representantInvolveringsBeskrivelse: string

  harDatabehandlerRepresentantInvolvering?: boolean
  dataBehandlerRepresentantInvolveringBeskrivelse: string

  merknadTilPvoEllerRisikoeier: string
  merknadTilRisikoeier: string
  merknadFraRisikoeier: string

  sendtTilPvoDato: string
  sendtTilPvoAv: string
  antallInnsendingTilPvo: number

  godkjentAvRisikoeierDato: string
  godkjentAvRisikoeier: string
}

export interface IPvkDokumentListItem {
  id: string
  changeStamp: IChangeStamp
  etterlevelseDokumentId: string
  status: EPvkDokumentStatus
  title: string
  etterlevelseNummer: number
  sendtTilPvoDato: string
  sendtTilPvoAv: string
}

export enum EPvkDokumentStatus {
  UNDERARBEID = 'UNDERARBEID',
  SENDT_TIL_PVO = 'SENDT_TIL_PVO',
  PVO_UNDERARBEID = 'PVO_UNDERARBEID',
  VURDERT_AV_PVO = 'VURDERT_AV_PVO',
  VURDERT_AV_PVO_TRENGER_MER_ARBEID = 'VURDERT_AV_PVO_TRENGER_MER_ARBEID',
  SENDT_TIL_PVO_FOR_REVURDERING = 'SENDT_TIL_PVO_FOR_REVURDERING',
  TRENGER_GODKJENNING = 'TRENGER_GODKJENNING',
  GODKJENT_AV_RISIKOEIER = 'GODKJENT_AV_RISIKOEIER',
}

export enum EPVK {
  behandlingAvPersonopplysninger = 'I Behandlingskatalogen står det at dere behandler personopplysninger om:',
}
