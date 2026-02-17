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
  berOmNyVurderingFraPvo?: boolean
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

  // response field only
  currentEtterlevelseDokumentVersjon: number
  hasPvkDocumentationStarted: boolean
  hasPvkDocumentBeenUpdatedAfterApproval: boolean
}

export interface IMeldingTilPvo {
  innsendingId: number
  merknadTilPvo: string
  endringsNotat: string
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

export enum EPVKTilstandStatus {
  TILSTAND_STATUS_ONE = 'IKKE_VURDERT_BEHOV_FOR_PVK',
  TILSTAND_STATUS_TWO = 'SKAL_IKKE_GJORE_PVK',
  TILSTAND_STATUS_THREE = 'SKAL_GJORE_PVK_MEN_IKKE_PABEGYNT',
  TILSTAND_STATUS_FOUR = 'PVK_UNDER_ARBEID_FOR_FORSTE_GANG_FOR_INNSENDING',
  TILSTAND_STATUS_FIVE = 'PVK_SENDT_TIL_PVO_TELLES_SOM_UNDERARBEID',
  TILSTAND_STATUS_SIX = 'PVO_HAR_GITT_TILBAKEMELDING_ETTERLEVER_KAN_REDIGERE_TELLES_SOM_UNDER_ARBEID',
  TILSTAND_STATUS_SEVEN = 'ETTERLEVER_HAR_SENDT_TILBAKE_TIL_PVO_TELLES_SOM_UNDER_ARBEID',
  TILSTAND_STATUS_EIGHT = 'ETTERLEVER_HAR_SENDT_TIL_RISIKOEIER_TELLES_SOM_UNDER_ARBEID',
  TILSTAND_STATUS_NINE = 'RISIKOEIER_HAR_GODKJENT_ETTERLEVER_HAR_IKKE_ENDRET_SIDEN',
  TILSTAND_STATUS_TEN = 'ETTERLEVER_HAR_BEGYNT_MED_NYE_ENDRINGER_TELLES_SOM_UNDER_ARBEID',
  TILSTAND_STATUS_ELEVEN = 'ETTERLEVER_HAR_SENDT_OPPDATERT_PVK_DIREKTE_TIL_RISIKOEIER_TELLES_SOM_UNDER_ARBEID',
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
