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
      <ActionMenu.Group label='Dokumenter'>
        <ActionMenu.Item as='a' href=''>
          Rediger dokumentegenskaper
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Administrer etterlevelsedokument'>
        <ActionMenu.Item as='a' href=''>
          Godkjenn etterlevelsen
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
