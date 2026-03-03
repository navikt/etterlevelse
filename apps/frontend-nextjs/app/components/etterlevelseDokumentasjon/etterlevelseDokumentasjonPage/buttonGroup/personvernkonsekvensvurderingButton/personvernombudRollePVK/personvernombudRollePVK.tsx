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
  PvkOppdatertEtterNyVersjonActionMenuVariant,
  PvkPabegyntActionMenuVariant,
} from '../commonActionMenuPVK/commonPVK'
import { PersonvernombudSendtForTilbakemeldingActionMenuVariant } from '../commonActionMenuPVK/personvernombudCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
  behandlingsLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
}

const PersonvernombudRollePVK: FunctionComponent<TProps> = ({
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
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return (
        <PvkIkkePabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return (
        <PersonvernombudSendtForTilbakemeldingActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return (
        <PvkPabegyntActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return (
        <PvkOppdatertEtterNyVersjonActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    default:
      return <>Feilmelding: Denne tilstanden finnes ikke</>
  }
}

export default PersonvernombudRollePVK
