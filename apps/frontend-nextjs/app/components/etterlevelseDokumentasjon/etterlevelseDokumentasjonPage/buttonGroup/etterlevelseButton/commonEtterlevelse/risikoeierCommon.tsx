import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const RisikoeierVariantOne = () => (
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
        Godkjenn etterlevelsen
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
