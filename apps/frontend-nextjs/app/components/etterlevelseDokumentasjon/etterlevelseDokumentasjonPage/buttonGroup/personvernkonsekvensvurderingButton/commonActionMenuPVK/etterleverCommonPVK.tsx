import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='REVURDER_BEHOV'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='PABEGYNN'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='REVURDER_BEHOV'
      />
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_READONLY_GODKJENT_VERSJON_OG_OPPDATER'
      />

      <PvkBehovActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_OM_BEHOV_READONLY'
      />
    </ActionMenu.Content>
  </ActionMenu>
)
