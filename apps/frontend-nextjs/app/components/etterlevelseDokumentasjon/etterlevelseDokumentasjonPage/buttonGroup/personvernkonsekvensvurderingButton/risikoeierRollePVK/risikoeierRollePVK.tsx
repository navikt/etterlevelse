import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  PvkIkkePabegyntActionMenuVariant,
  PvkOppdatertEtterNyVersjonActionMenuVariant,
  PvkPabegyntActionMenuVariant,
} from '../commonPVK/commonPVK'
import { RisikoeierVariantOnePVK, RisikoeierVariantTwoPVK } from '../commonPVK/risikoeierCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
}

const test: string = EPVKTilstandStatus.TILSTAND_STATUS_SEVEN

const RisikoeierRollePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
}) => {
  switch (test) {
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
      return <RisikoeierVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <RisikoeierVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return (
        <PvkOppdatertEtterNyVersjonActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvkDokument={pvkDokument}
        />
      )
    default:
      return <></>
  }
}

export default RisikoeierRollePVK
