import { EPVKActionMenuTilstandsKnapper } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ActionMenu } from '@navikt/ds-react'
import { ActionMenuTriggerPKV } from './commonPVK'

export const RisikoeierVariantOnePVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_AO}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.LES_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.GODKJENN_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const RisikoeierVariantTwoPVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_AO}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.LES_GODKJENT_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
