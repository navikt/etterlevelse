import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  PvkIkkePabegyntActionMenuVariant,
  PvkPabegyntActionMenuVariant,
} from '../commonActionMenuPVK/commonPVK'
import {
  RisikoeierGodkjentPvkActionMenuVariant,
  RisikoeierPvkTrengerGodkjenningActionMenuVariant,
  RisikoeierPvkTrengerGodkjenningNyVersjonActionMenuVariant,
} from '../commonActionMenuPVK/risikoeierCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
}

const RisikoeierRollePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
}) => {
  const getPvkTilstand = (): EPVKTilstandStatus | string => {
    if ((pvkDokument && pvkDokument.hasPvkDocumentationStarted === false) || !pvkDokument) {
      // Will render same component for statuses [will not do pvk, will do pvk but documentation not yet started]
      // DVS  EPVKTilstandStatus.TILSTAND_STATUS_TWO,  EPVKTilstandStatus.TILSTAND_STATUS_THREE
      return EPVKTilstandStatus.TILSTAND_STATUS_ONE
    } else if (
      etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1 &&
      pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_EIGHT
    } else if (
      etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1 &&
      pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_NINE
    } else if (
      etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 &&
      pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_TEN
    } else {
      return 'default'
    }
  }

  switch (getPvkTilstand()) {
    // Will render same component for statuses [will not do pvk, will do pvk but documentation not yet started]
    // DVS  EPVKTilstandStatus.TILSTAND_STATUS_TWO,  EPVKTilstandStatus.TILSTAND_STATUS_THREE
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return (
        <RisikoeierPvkTrengerGodkjenningActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return (
        <RisikoeierGodkjentPvkActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return (
        <RisikoeierPvkTrengerGodkjenningNyVersjonActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    default:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
  }
}

export default RisikoeierRollePVK
