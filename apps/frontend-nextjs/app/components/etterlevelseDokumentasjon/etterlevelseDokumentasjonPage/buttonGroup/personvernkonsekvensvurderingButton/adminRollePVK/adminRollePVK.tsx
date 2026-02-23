import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  AdminMedAlleAndreRollerOgsaSkruddPaVariantThree,
  AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo,
} from '../commonActionMenuPVK/adminCommonPVK'
import {
  PvkHarFattTilbakemeldingFraPvoActionMenuVariant,
  PvkIkkeVurdertActionMenuVariant,
  PvkSendtTilPvoEllerRisikoeierActionMenuVariant,
  PvkUnderArbeidActionMenuVariant,
} from '../commonActionMenuPVK/commonPVK'
import { EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant } from '../commonActionMenuPVK/etterleverCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  pvkDokument?: IPvkDokument
}

const AdminRollePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
  pvkDokument,
}) => {
  const getPvkTilstand = (): EPVKTilstandStatus => {
    if (
      pvkDokument &&
      (pvkDokument.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE ||
        pvkDokument.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT)
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_TWO
    } else if (
      pvkDokument &&
      pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
      pvkDokument.hasPvkDocumentationStarted === false
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_THREE
    } else if (
      pvkDokument &&
      pvkDokument.pvkVurdering === EPvkVurdering.SKAL_UTFORE &&
      pvkDokument.hasPvkDocumentationStarted === true
    ) {
      if (pvkDokument.antallInnsendingTilPvo === 1) {
        return EPVKTilstandStatus.TILSTAND_STATUS_FOUR
      } else if (pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO) {
        return EPVKTilstandStatus.TILSTAND_STATUS_FIVE
      } else if (
        [
          EPvkDokumentStatus.VURDERT_AV_PVO,
          EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
        ].includes(pvkDokument.status)
      ) {
        return EPVKTilstandStatus.TILSTAND_STATUS_SIX
      } else if (pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) {
        return EPVKTilstandStatus.TILSTAND_STATUS_SEVEN
      } else if (pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING) {
        return EPVKTilstandStatus.TILSTAND_STATUS_EIGHT
      } else if (pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
        return EPVKTilstandStatus.TILSTAND_STATUS_NINE
      } else if (
        etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 &&
        pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO
      ) {
        return EPVKTilstandStatus.TILSTAND_STATUS_TEN
      } else {
        return EPVKTilstandStatus.TILSTAND_STATUS_FOUR
      }
    } else {
      return EPVKTilstandStatus.TILSTAND_STATUS_ONE
    }
  }

  switch (getPvkTilstand()) {
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return (
        <PvkIkkeVurdertActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return (
        <PvkIkkeVurdertActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return (
        <EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return (
        <PvkUnderArbeidActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return (
        <PvkSendtTilPvoEllerRisikoeierActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return (
        <PvkHarFattTilbakemeldingFraPvoActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return (
        <PvkSendtTilPvoEllerRisikoeierActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return (
        <PvkUnderArbeidActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    default:
      return <></>
  }
}

export default AdminRollePVK
