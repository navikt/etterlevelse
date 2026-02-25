import { EPVKActionMenuTilstandsKnapper } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ActionMenu } from '@navikt/ds-react'
import { ActionMenuTriggerPKV } from './commonPVK'

export const EtterleverVariantOne = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.BESKRIV_AO}
        {EPVKActionMenuTilstandsKnapper.BESKRIV_AO}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.REVURDER_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantTwo = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.BESKRIV_AO}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.PABEGYNN_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.REVURDER_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantThree = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.BESKRIV_AO}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.LES_OPPDATER_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.REVURDER_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
