import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const PersonvernombudVariantOne = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        PVK
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Se Behandlingens livsløp (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Behov for PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PersonvernombudVariantTwo = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        PVK
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Se Behandlingens livsløp (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Les PVK (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Behov for PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PersonvernombudVariantThree = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        PVK
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Se Behandlingens livsløp (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Vurderer PVK (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Behov for PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const PersonvernombudVariantFour = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        PVK
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Se Behandlingens livsløp (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Les PVK (read-only, ny versjon)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se Behov for PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
