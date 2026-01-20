import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

const PVKButton = () => (
  <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
    PVK
  </Button>
)

export const VariantOne = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <PVKButton />
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        See behandlingens livsløp (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Les PVK (read-only)
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
