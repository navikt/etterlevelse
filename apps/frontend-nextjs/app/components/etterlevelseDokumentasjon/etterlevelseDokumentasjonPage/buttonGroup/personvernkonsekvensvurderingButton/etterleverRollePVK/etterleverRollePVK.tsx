import {
  EPVKTilstandStatus,
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  PvkHarFattTilbakemeldingFraPvoActionMenuVariant,
  PvkIkkeVurdertActionMenuVariant,
  PvkSendtTilPvoActionMenuVariant,
  PvkUnderArbeidActionMenuVariant,
} from '../commonPVK/commonPVK'
import {
  EtterleverSkalIkkeUtforePvkActionMenuVariant,
  EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant,
  EtterleverVariantThree,
} from '../commonPVK/etterleverCommonPVK'

type TProps = {
  pvkDokument?: IPvkDokument
}

const EtterleverRollePVK: FunctionComponent<TProps> = ({ pvkDokument }) => {
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
      } else {
        return EPVKTilstandStatus.TILSTAND_STATUS_TWO
      }
    } else {
      return EPVKTilstandStatus.TILSTAND_STATUS_ONE
    }
  }

  switch (getPvkTilstand()) {
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <PvkIkkeVurdertActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <EtterleverSkalIkkeUtforePvkActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <PvkUnderArbeidActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <PvkSendtTilPvoActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <PvkHarFattTilbakemeldingFraPvoActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <PvkSendtTilPvoActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <PvkSendtTilPvoActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <EtterleverVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <PvkUnderArbeidActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <PvkSendtTilPvoActionMenuVariant />
    default:
      return <></>
  }
}

export default EtterleverRollePVK
