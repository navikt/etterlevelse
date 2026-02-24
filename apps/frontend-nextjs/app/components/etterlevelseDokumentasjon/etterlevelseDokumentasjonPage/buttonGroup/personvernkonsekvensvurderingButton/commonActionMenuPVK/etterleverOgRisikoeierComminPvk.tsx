import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ActionMenu } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import {
  BehandlingensLivslopActionMenuItem,
  PvkActionMenuTrigger,
} from './commonActionMenuComponentsPvk'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument?: IPvkDokument
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
}

export const EtterleverOgRisikoeierPvkSendtTilPvoEllerRisikoeierActionMenuVariant: FunctionComponent<
  TProps
> = ({ etterlevelseDokumentasjon, pvkDokument, behandlingensArtOgOmfang, behandlingsLivslop }) => (
  <ActionMenu>
    <PvkActionMenuTrigger />
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <BehandlingensLivslopActionMenuItem
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          behandlingensLivslopId={behandlingsLivslop ? behandlingsLivslop.id : 'ny'}
          readOnly={true}
        />
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
            etterlevelseDokumentasjon.id,
            behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
          )}
        >
          Se Art og omfang (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonStepUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny',
            1
          )}
        >
          Les PVK (read-only)
        </ActionMenu.Item>
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
        <ActionMenu.Item
          as='a'
          href={pvkDokumentasjonPvkBehovUrl(
            etterlevelseDokumentasjon.id,
            pvkDokument ? pvkDokument.id : 'ny'
          )}
        >
          Les om behov for PVK (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
