import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const CommonVariantOne = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Etterlevelse
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Rediger dokumentegenskaper
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Eksporter til Word
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const CommonVariantTwo = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Etterlevelse
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Rediger dokumentegenskaper
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Oppdater etterlevelsen
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Eksporter til Word
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
