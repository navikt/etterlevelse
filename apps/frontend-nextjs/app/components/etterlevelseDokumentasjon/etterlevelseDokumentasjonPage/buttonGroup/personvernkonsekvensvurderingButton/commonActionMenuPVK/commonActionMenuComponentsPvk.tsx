import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

export const PvkActionMenuTrigger = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Personvernkonsekvensvurdering (PVK)
    </Button>
  </ActionMenu.Trigger>
)

type TBehandlingensLivslopActionMenuItemProp = {
  etterlevelseDokumentasjonId: string
  behandlingensLivslopId: string
  readOnly?: boolean
}

export const BehandlingensLivslopActionMenuItem: FunctionComponent<
  TBehandlingensLivslopActionMenuItemProp
> = ({ etterlevelseDokumentasjonId, behandlingensLivslopId, readOnly }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonBehandlingsenLivslopUrl(
      etterlevelseDokumentasjonId,
      behandlingensLivslopId
    )}
  >
    {readOnly ? 'Se Behandlingens livsløp (read-only)' : 'Tegn Behandlingens livsløp'}
  </ActionMenu.Item>
)

type TBehandlingensArtOgOmfangActionMenuItemProp = {
  etterlevelseDokumentasjonId: string
  behandlingensArtOgOmfangId: string
  readOnly?: boolean
}

export const ArtOgOmfangActionMenuItem: FunctionComponent<
  TBehandlingensArtOgOmfangActionMenuItemProp
> = ({ etterlevelseDokumentasjonId, behandlingensArtOgOmfangId, readOnly }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
      etterlevelseDokumentasjonId,
      behandlingensArtOgOmfangId
    )}
  >
    {readOnly ? 'Se Art og omfang (read-only)' : 'Beskriv art og omfang'}
  </ActionMenu.Item>
)
