import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentasjonPvkBehovUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import {
  ArtOgOmfangActionMenuItem,
  BehandlingensLivslopActionMenuItem,
  PvkActionMenuItem,
  PvkActionMenuTrigger,
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensLivslopId={behandlingsLivslop ? behandlingsLivslop.id : 'ny'}
      />

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonPvkBehovUrl(
          etterlevelseDokumentasjon.id,
          pvkDokument ? pvkDokument.id : 'ny'
        )}
      >
        Revurder behov for PVK
      </ActionMenu.Item>
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensLivslopId={behandlingsLivslop ? behandlingsLivslop.id : 'ny'}
      />

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='PABEGYNN'
      />

      <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonPvkBehovUrl(
          etterlevelseDokumentasjon.id,
          pvkDokument ? pvkDokument.id : 'ny'
        )}
      >
        Revurder Behov for PVK
      </ActionMenu.Item>
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
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensLivslopId={behandlingsLivslop ? behandlingsLivslop.id : 'ny'}
        readOnly={true}
      />

      <ArtOgOmfangActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        behandlingensArtOgOmfangId={behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'}
      />

      <PvkActionMenuItem
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        pvkDokumentId={pvkDokument?.id}
        variant='LES_READONLY_GODKJENT_VERSJON_OG_OPPDATER'
      />

      <ActionMenu.Item
        as='a'
        href={pvkDokumentasjonPvkBehovUrl(
          etterlevelseDokumentasjon.id,
          pvkDokument ? pvkDokument.id : 'ny'
        )}
      >
        Les om behov for PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
