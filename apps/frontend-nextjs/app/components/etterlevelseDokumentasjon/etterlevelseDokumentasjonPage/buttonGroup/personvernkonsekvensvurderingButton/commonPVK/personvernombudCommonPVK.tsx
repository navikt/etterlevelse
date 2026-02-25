import { EPVKActionMenuTilstandsKnapper } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ActionMenu } from '@navikt/ds-react'
import { ActionMenuTriggerPKV } from './commonPVK'

export const PersonvernombudVariantOne = () => (
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
        {EPVKActionMenuTilstandsKnapper.VURDER_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
