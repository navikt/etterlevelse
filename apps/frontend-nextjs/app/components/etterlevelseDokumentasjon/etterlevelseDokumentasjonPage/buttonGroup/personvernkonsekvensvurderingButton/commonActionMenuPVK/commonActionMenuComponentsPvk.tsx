import {
  pvkDokumentasjonBehandlingsenArtOgOmfangUrl,
  pvkDokumentasjonBehandlingsenLivslopUrl,
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
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
    {readOnly ? 'Se Behandlingens livsløp' : 'Tegn Behandlingens livsløp'}
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
    {readOnly ? 'Se behandlingens art og omfang' : 'Beskriv behandlingens art og omfang'}
  </ActionMenu.Item>
)

export type TPvkBehovActionMenuVariant =
  | 'LES_OM_BEHOV_READONLY'
  | 'SE_BEHOV_READONLY'
  | 'VURDER_BEHOV'
  | 'REVURDER_BEHOV'

const pvkBehovActionMenuVariantToText = (variant: TPvkBehovActionMenuVariant): string => {
  switch (variant) {
    case 'LES_OM_BEHOV_READONLY':
      return 'Les om behov for PVK'
    case 'SE_BEHOV_READONLY':
      return 'Se behov for PVK'
    case 'VURDER_BEHOV':
      return 'Vurder behov for PVK'
    case 'REVURDER_BEHOV':
      return 'Revurder behov for PVK'
  }
}

export const PvkBehovActionMenuItem: FunctionComponent<{
  etterlevelseDokumentasjonId: string
  pvkDokumentId?: string | number
  variant: TPvkBehovActionMenuVariant
}> = ({ etterlevelseDokumentasjonId, pvkDokumentId, variant }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonPvkBehovUrl(etterlevelseDokumentasjonId, `${pvkDokumentId ?? 'ny'}`)}
  >
    {pvkBehovActionMenuVariantToText(variant)}
  </ActionMenu.Item>
)

export type TPvkActionMenuVariant =
  | 'LES_READONLY'
  | 'FULLFOR'
  | 'LES_PVO_TILBAKEMELDING'
  | 'PABEGYNN'
  | 'LES_READONLY_GODKJENT_VERSJON_OG_OPPDATER'
  | 'LES_READONLY_GODKJENT_VERSJON'
  | 'LES_READONLY_NY_VERSJON'

const pvkActionMenuVariantToText = (variant: TPvkActionMenuVariant): string => {
  switch (variant) {
    case 'LES_READONLY':
      return 'Les PVK'
    case 'FULLFOR':
      return 'Fullfør PVK'
    case 'LES_PVO_TILBAKEMELDING':
      return 'Les PVOs tilbakemelding'
    case 'PABEGYNN':
      return 'Påbegynn PVK'
    case 'LES_READONLY_GODKJENT_VERSJON_OG_OPPDATER':
      return 'Les PVK'
    case 'LES_READONLY_GODKJENT_VERSJON':
      return 'Les PVK '
    case 'LES_READONLY_NY_VERSJON':
      return 'Les PVK'
  }
}

export const PvkActionMenuItem: FunctionComponent<{
  etterlevelseDokumentasjonId: string
  pvkDokumentId?: string | number
  variant: TPvkActionMenuVariant
  step?: number
}> = ({ etterlevelseDokumentasjonId, pvkDokumentId, variant, step = 1 }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonStepUrl(etterlevelseDokumentasjonId, pvkDokumentId ?? 'ny', step)}
  >
    {pvkActionMenuVariantToText(variant)}
  </ActionMenu.Item>
)
