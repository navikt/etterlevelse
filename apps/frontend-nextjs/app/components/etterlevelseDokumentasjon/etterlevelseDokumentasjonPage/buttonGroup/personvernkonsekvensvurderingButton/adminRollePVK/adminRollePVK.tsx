import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { getPvkTilstand } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FunctionComponent } from 'react'
import { AdminPvkSendtTilPvoEllerRisikoeierActionMenuVariant } from '../commonActionMenuPVK/adminCommonPVK'
import {
  PvkHarFattTilbakemeldingFraPvoActionMenuVariant,
  PvkIkkeVurdertActionMenuVariant,
  PvkUnderArbeidActionMenuVariant,
} from '../commonActionMenuPVK/commonPVK'
import {
  EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant,
  PvkGodkjentAvRisikoeierActionMenuVariant,
} from '../commonActionMenuPVK/etterleverCommonPVK'
import { EtterleverOgRisikoeierPvkSendtTilPvoEllerRisikoeierActionMenuVariant } from '../commonActionMenuPVK/etterleverOgRisikoeierComminPvk'

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
  switch (getPvkTilstand(etterlevelseDokumentasjon, pvkDokument)) {
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
        <AdminPvkSendtTilPvoEllerRisikoeierActionMenuVariant
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
        <AdminPvkSendtTilPvoEllerRisikoeierActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return (
        <EtterleverOgRisikoeierPvkSendtTilPvoEllerRisikoeierActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return (
        <PvkGodkjentAvRisikoeierActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
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
