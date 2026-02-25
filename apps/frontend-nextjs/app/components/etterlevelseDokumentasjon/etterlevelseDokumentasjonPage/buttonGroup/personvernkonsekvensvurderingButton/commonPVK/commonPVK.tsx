import { EPVKActionMenuTilstandsKnapper } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const ActionMenuTriggerPKV = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Personvernkonsekvensvurdering (PVK)
    </Button>
  </ActionMenu.Trigger>
)

export const CommonVariantOnePVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantTwoPVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantThreePVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.LES_PVK_NY}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.SE_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantFourPVK = () => (
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
        {EPVKActionMenuTilstandsKnapper.VURDER_BEHOV_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantFivePVK = () => (
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
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantSixPVK = () => (
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
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantSevenPVK = () => (
  <ActionMenu>
    <ActionMenuTriggerPKV />
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.TEGN_BBL}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.FULLFOR_PVK}
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        {EPVKActionMenuTilstandsKnapper.LES_TILBAKEMELDING_PVO}
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
