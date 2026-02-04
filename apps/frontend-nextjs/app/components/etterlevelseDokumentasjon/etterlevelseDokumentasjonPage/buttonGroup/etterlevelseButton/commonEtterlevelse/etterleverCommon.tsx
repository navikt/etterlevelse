import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const EtterleverVariantOne = () => (
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
        Få etterlevelsen godkjent av risikoeier
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Eksporter til Word
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantTwo = () => (
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
        Beslutning trenges, skal etterleveren også kunne redigere nå?
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
