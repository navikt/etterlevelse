import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import {
  ArtOgOmfangActionMenuItem,
  BehandlingensLivslopActionMenuItem,
  PvkActionMenuTrigger,
  PvkBehovActionMenuItem,
  PvkDokumentActionMenuItem,
} from './commonActionMenuComponentsPvk'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument?: IPvkDokument
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
}

export const EtterleverSkalIkkeUtforePvkActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => (
  <ActionMenu>
    <PvkActionMenuTrigger />
    <ActionMenu.Content>
      <BehandlingensLivslopActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensLivslop={behandlingsLivslop}
      >
        Tegn Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Beskriv behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Revurder behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverSkalUtforePvkIkkePabegyntActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => (
  <ActionMenu>
    <PvkActionMenuTrigger />
    <ActionMenu.Content>
      <BehandlingensLivslopActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensLivslop={behandlingsLivslop}
      >
        Tegn Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Beskriv behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkDokumentActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Påbegynn PVK
      </PvkDokumentActionMenuItem>

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Revurder behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkGodkjentAvRisikoeierActionMenuVariant: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => (
  <ActionMenu>
    <PvkActionMenuTrigger />
    <ActionMenu.Content>
      <BehandlingensLivslopActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensLivslop={behandlingsLivslop}
      >
        Tegn Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Beskriv behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkDokumentActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les og oppdater PVK
      </PvkDokumentActionMenuItem>

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les om behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)
