import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { getPvkTilstand } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FunctionComponent } from 'react'
import { PvkGodkjentReadOnlyActionMenuVariant } from '../commonActionMenuPVK/etterleverCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument?: IPvkDokument
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvoTilbakemelding?: IPvoTilbakemelding
}

const LesRollePvk: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
  pvoTilbakemelding,
}) => {
  switch (getPvkTilstand(pvkDokument, pvoTilbakemelding)) {
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return (
        <PvkGodkjentReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    default:
      return undefined
  }
}

export default LesRollePvk
