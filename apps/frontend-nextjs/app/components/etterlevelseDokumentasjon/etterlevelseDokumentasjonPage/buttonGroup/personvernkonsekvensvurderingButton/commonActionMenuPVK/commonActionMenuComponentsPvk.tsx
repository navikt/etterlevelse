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
import { FunctionComponent } from 'react'

export const PvkActionMenuTrigger = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Personvernkonsekvensvurdering (PVK)
    </Button>
  </ActionMenu.Trigger>
)

type TBehandlingensLivslopActionMenuItemProp = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  children: string
  behandlingensLivslop?: IBehandlingensLivslop
}

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

type TBehandlingensArtOgOmfangActionMenuItemProp = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  children: string
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  readOnly?: boolean
}

export const ArtOgOmfangActionMenuItem: FunctionComponent<
  TBehandlingensArtOgOmfangActionMenuItemProp
> = ({ etterlevelseDokumentasjon, behandlingensArtOgOmfang, readOnly, children }) => (
  <ActionMenu.Item
    as='a'
    href={pvkDokumentasjonBehandlingsenArtOgOmfangUrl(
      etterlevelseDokumentasjon.id,
      behandlingensArtOgOmfang ? behandlingensArtOgOmfang.id : 'ny'
    )}
  >
    {readOnly ? 'Se behandlingens art og omfang' : 'Beskriv behandlingens art og omfang'}
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
      return 'Les og oppdater PVK'
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
