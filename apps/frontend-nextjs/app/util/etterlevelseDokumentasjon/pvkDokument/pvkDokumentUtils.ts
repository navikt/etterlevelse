import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import moment from 'moment'

export const getVariantForPVKBehovButton = (
  pvkDokument: IPvkDokument | undefined,
  behandlingsLivslop: IBehandlingensLivslop | undefined
) => {
  if (pvkDokument) {
    return 'tertiary'
  } else if (
    (behandlingsLivslop && behandlingsLivslop.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
  ) {
    return 'primary'
  } else {
    return 'secondary'
  }
}

export const getVariantForPVKButton = (
  pvkDokument: IPvkDokument | undefined,
  behandlingsLivslop: IBehandlingensLivslop | undefined
) => {
  if (pvkDokument?.skalUtforePvk === false) return 'tertiary'
  if (
    (behandlingsLivslop && behandlingsLivslop?.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
  )
    return 'primary'
  return 'secondary'
}

export const isReadOnlyPvkStatus = (status: string) => {
  return [
    EPvkDokumentStatus.PVO_UNDERARBEID.toString(),
    EPvkDokumentStatus.SENDT_TIL_PVO.toString(),
    EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING.toString(),
  ].includes(status)
}

export const isPvkDokumentVurdert = (pvkDokument?: IPvkDokument) =>
  pvkDokument &&
  (pvkDokument.ytterligereEgenskaper.length !== 0 || pvkDokument.skalUtforePvk !== null)

export const isPvkDokuemntNotStarted = (
  risikoscenarioList: IRisikoscenario[],
  pvkDokument?: IPvkDokument
) =>
  pvkDokument &&
  pvkDokument.personkategoriAntallBeskrivelse === '' &&
  pvkDokument.tilgangsBeskrivelsePersonopplysningene === '' &&
  pvkDokument.lagringsBeskrivelsePersonopplysningene === '' &&
  pvkDokument.representantInvolveringsBeskrivelse === '' &&
  pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse === '' &&
  pvkDokument.stemmerPersonkategorier === null &&
  pvkDokument.harInvolvertRepresentant === null &&
  pvkDokument.harDatabehandlerRepresentantInvolvering === null &&
  risikoscenarioList.length === 0

export const getPvkButtonText = (
  pvkDokument: IPvkDokument,
  risikoscenarioList: IRisikoscenario[]
) => {
  const updatedAfterApprovedOfRisikoeier =
    pvkDokument.godkjentAvRisikoeierDato !== '' &&
    moment(pvkDokument.changeStamp.lastModifiedDate)
      .seconds(0)
      .milliseconds(0)
      .isAfter(moment(pvkDokument.godkjentAvRisikoeierDato).seconds(0).milliseconds(0))

  if (isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument)) {
    return 'Påbegynn PVK'
  } else if (
    !isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument) &&
    pvkDokument.status === EPvkDokumentStatus.UNDERARBEID
  ) {
    return 'Fullfør PVK'
  } else if (
    !isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument) &&
    isReadOnlyPvkStatus(pvkDokument.status)
  ) {
    return 'Les PVK'
  } else if (
    !isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument) &&
    [
      EPvkDokumentStatus.VURDERT_AV_PVO,
      EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
      EPvkDokumentStatus.TRENGER_GODKJENNING,
    ].includes(pvkDokument.status)
  ) {
    return 'Les tilbakemelding fra PVO'
  } else if (
    !isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument) &&
    pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
    !updatedAfterApprovedOfRisikoeier
  ) {
    return 'Les godkjent PVK'
  } else if (
    !isPvkDokuemntNotStarted(risikoscenarioList, pvkDokument) &&
    pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
    updatedAfterApprovedOfRisikoeier
  ) {
    return 'Oppdatér PVK'
  }
}
