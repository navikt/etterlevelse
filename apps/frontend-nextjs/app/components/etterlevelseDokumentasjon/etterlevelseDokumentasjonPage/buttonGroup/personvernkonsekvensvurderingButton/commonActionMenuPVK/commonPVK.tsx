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
  PvkActionMenuItem,
  PvkActionMenuTrigger,
  PvkBehovActionMenuItem,
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
        readOnly={true}
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
        readOnly={true}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_READONLY'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
        readOnly={true}
      />

      <ActionMenu.Item
        as='a'
        href={pvkDokumenteringPvoTilbakemeldingUrl(pvkDokument ? pvkDokument.id : 'ny', 1)}
      >
        Vurderer PVK (ny versjon)
      </ActionMenu.Item>
      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='VURDER_BEHOV'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='FULLFOR'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_OM_BEHOV_READONLY'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
        readOnly={true}
      />
      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_READONLY'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_OM_BEHOV_READONLY'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
        readOnly={true}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_PVO_TILBAKEMELDING'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_OM_BEHOV_READONLY'
      />
    </ActionMenu.Content>
  </ActionMenu>
)
