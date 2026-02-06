import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const CommonVariantOneGjenbruk = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Gjenbruk
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Tilrettelegg for Gjenbruk
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Slå på Gjenbruk
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Nullstill Gjenbruk
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Endre Gjenbruk
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Nullstill Gjenbruk
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
