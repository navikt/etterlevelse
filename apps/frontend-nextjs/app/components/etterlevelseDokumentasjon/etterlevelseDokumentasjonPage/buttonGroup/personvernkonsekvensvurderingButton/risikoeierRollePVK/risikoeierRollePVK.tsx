import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { getPvkTilstand } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
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
  switch (getPvkTilstand(etterlevelseDokumentasjon, pvkDokument)) {
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return (
        <PvkPabegyntActionMenuVariant
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
      return <>Feilmelding: Denne tilstanden finnes ikke</>
  }
}

export default RisikoeierRollePVK
