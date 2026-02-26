import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
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

export const PvkIkkePabegyntActionMenuVariant: FunctionComponent<TProps> = ({
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
        Se Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Se behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les om behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkPabegyntActionMenuVariant: FunctionComponent<TProps> = ({
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
        Se Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Se behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkDokumentActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les PVK
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

export const PvkOppdatertEtterNyVersjonActionMenuVariant: FunctionComponent<TProps> = ({
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
        Se Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Se behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <ActionMenu.Item
        as='a'
        href={pvkDokumenteringPvoTilbakemeldingUrl(pvkDokument ? pvkDokument.id : 'ny', 1)}
      >
        Vurderer PVK (ny versjon)
      </ActionMenu.Item>
      <PvkBehovActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les om behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkIkkeVurdertActionMenuVariant: FunctionComponent<TProps> = ({
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
        Vurder behov for PVK
      </PvkBehovActionMenuItem>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PvkUnderArbeidActionMenuVariant: FunctionComponent<TProps> = ({
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
        Fullfør PVK
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

export const PvkSendtTilPvoEllerRisikoeierActionMenuVariant: FunctionComponent<TProps> = ({
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
        Se Behandlingens livsløp
      </BehandlingensLivslopActionMenuItem>

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      >
        Se behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkDokumentActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les PVK
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

export const PvkHarFattTilbakemeldingFraPvoActionMenuVariant: FunctionComponent<TProps> = ({
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
        Se behandlingens art og omfang
      </ArtOgOmfangActionMenuItem>

      <PvkDokumentActionMenuItem
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        pvkDokument={pvkDokument}
      >
        Les PVOs tilbakemelding
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
