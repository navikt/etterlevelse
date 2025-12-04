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
  pvkVurdering?: EPvkVurdering
  pvkVurderingsBegrunnelse: string

  harInvolvertRepresentant?: boolean
  representantInvolveringsBeskrivelse: string

  harDatabehandlerRepresentantInvolvering?: boolean
  dataBehandlerRepresentantInvolveringBeskrivelse: string

  merknadTilRisikoeier: string
  merknadFraRisikoeier: string

  meldingerTilPvo: IMeldingTilPvo[]
  antallInnsendingTilPvo: number

  godkjentAvRisikoeierDato: string
  godkjentAvRisikoeier: string
}

export interface IMeldingTilPvo {
  innsendingId: number
  merknadTilPvo: string
  sendtTilPvoDato: string
  sendtTilPvoAv: string
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
  antallInnsendingTilPvo: number
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

export enum EPvkVurdering {
  SKAL_IKKE_UTFORE = 'SKAL_IKKE_UTFORE',
  SKAL_UTFORE = 'SKAL_UTFORE',
  ALLEREDE_UTFORT = 'ALLEREDE_UTFORT',

  //Brukes for å nullstille feltet på frontend
  UNDEFINED = 'UNDEFINED',
}

export enum EPVK {
  behandlingAvPersonopplysninger = 'I Behandlingskatalogen står det at dere behandler personopplysninger om:',
}
