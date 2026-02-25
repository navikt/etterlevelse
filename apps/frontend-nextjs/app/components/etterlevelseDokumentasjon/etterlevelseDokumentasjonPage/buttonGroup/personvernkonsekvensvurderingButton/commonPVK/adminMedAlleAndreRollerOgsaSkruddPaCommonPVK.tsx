import { EPVKActionMenuTilstandsKnapper } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ActionMenu } from '@navikt/ds-react'
import { ActionMenuTriggerPKV } from './commonPVK'

export const AdminMedAlleAndreRollerOgsaSkruddPaVariantOne = () => (
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
        {EPVKActionMenuTilstandsKnapper.VURDER_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo = () => (
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
    </ActionMenu.Content>
  </ActionMenu>
)

export const AdminMedAlleAndreRollerOgsaSkruddPaVariantThree = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
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
