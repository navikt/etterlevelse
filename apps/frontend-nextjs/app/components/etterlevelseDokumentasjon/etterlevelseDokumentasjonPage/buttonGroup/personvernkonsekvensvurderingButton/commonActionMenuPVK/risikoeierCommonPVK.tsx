import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
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

export const RisikoeierPvkTrengerGodkjenningActionMenuVariant: FunctionComponent<TProps> = ({
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

      <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonStepUrl(
          etterlevelseDokumentasjon.id,
          pvkDokument ? pvkDokument.id : 'ny',
          8
        )}
      >
        Godkjenn PVK
      </ActionMenu.Item>
      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
    </ActionMenu.Content>
  </ActionMenu>
)

export const RisikoeierGodkjentPvkActionMenuVariant: FunctionComponent<TProps> = ({
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
        variant='LES_READONLY_GODKJENT_VERSJON'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
    </ActionMenu.Content>
  </ActionMenu>
)

export const RisikoeierPvkTrengerGodkjenningNyVersjonActionMenuVariant: FunctionComponent<
  TProps
> = ({ etterlevelseDokumentasjon, pvkDokument, behandlingensArtOgOmfang, behandlingsLivslop }) => (
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
        variant='LES_READONLY_NY_VERSJON'
      />

      <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonStepUrl(
          etterlevelseDokumentasjon.id,
          pvkDokument ? pvkDokument.id : 'ny',
          8
        )}
      >
        Godkjenn PVK (ny versjon)
      </ActionMenu.Item>
      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='SE_BEHOV_READONLY'
      />
    </ActionMenu.Content>
  </ActionMenu>
)
