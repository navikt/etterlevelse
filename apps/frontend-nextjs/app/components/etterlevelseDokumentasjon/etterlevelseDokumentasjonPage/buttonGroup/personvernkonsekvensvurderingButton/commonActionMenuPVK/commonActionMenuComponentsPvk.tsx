import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent, PropsWithChildren } from 'react'

export const PvkActionMenuTrigger = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Personvernkonsekvensvurdering (PVK)
    </Button>
  </ActionMenu.Trigger>
)

type TBehandlingensLivslopActionMenuItemProp = PropsWithChildren<{
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  behandlingensLivslop?: IBehandlingensLivslop
}>

export const BehandlingensLivslopActionMenuItem: FunctionComponent<
  TBehandlingensLivslopActionMenuItemProp
> = ({ etterlevelseDokumentasjon, behandlingensLivslop, children }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonBehandlingsenLivslopUrl(
      etterlevelseDokumentasjon.id,
      behandlingensLivslop ? behandlingensLivslop.id : 'ny'
    )}
  >
    {children}
  </ActionMenu.Item>
)

type TBehandlingensArtOgOmfangActionMenuItemProp = PropsWithChildren<{
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
}>

export const ArtOgOmfangActionMenuItem: FunctionComponent<
  TBehandlingensArtOgOmfangActionMenuItemProp
> = ({ etterlevelseDokumentasjon, behandlingensArtOgOmfang, children }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
      etterlevelseDokumentasjon.id,
      behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
    )}
  >
    {children}
  </ActionMenu.Item>
)

export const PvkBehovActionMenuItem: FunctionComponent<{
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  children: string
  pvkDokument?: IPvkDokument
}> = ({ etterlevelseDokumentasjon, children, pvkDokument }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonPvkBehovUrl(
      etterlevelseDokumentasjon.id,
      pvkDokument ? pvkDokument.id : 'ny'
    )}
  >
    {children}
  </ActionMenu.Item>
)

export const PvkDokumentActionMenuItem: FunctionComponent<{
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  children: string
  pvkDokument?: IPvkDokument
}> = ({ etterlevelseDokumentasjon, pvkDokument, children }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonStepUrl(
      etterlevelseDokumentasjon.id,
      pvkDokument ? pvkDokument.id : 'ny',
      1
    )}
  >
    {children}
  </ActionMenu.Item>
)
