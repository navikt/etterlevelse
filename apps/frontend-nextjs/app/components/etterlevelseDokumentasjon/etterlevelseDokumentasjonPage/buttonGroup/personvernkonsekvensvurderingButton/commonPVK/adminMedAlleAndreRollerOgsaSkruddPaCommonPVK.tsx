import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

export const AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Personvernkonsekvensvurdering (PVK)
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <ActionMenu.Item as='a' href=''>
          Se Behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Se Art og omfang (read-only)
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Les PVK (read-only)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Godkjenn PVK
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)

export const AdminMedAlleAndreRollerOgsaSkruddPaVariantThree = () => (
  <ActionMenu>
    <ActionMenu.Trigger>
      <Button
        variant='secondary-neutral'
        icon={<ChevronDownIcon aria-hidden />}
        iconPosition='right'
      >
        Personvernkonsekvensvurdering (PVK)
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Group label='Forstå behandlingen'>
        <ActionMenu.Item as='a' href=''>
          Tegn Behandlingens livsløp
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Beskriv Art og omfang
        </ActionMenu.Item>
      </ActionMenu.Group>
      <ActionMenu.Group label='Personvernkonsekvensvurdering'>
        <ActionMenu.Item as='a' href=''>
          Les PVK (read-only, godkjent versjon) og Oppdater PVK (åpner neste versjon)
        </ActionMenu.Item>
        <ActionMenu.Item as='a' href=''>
          Revurder Behov for PVK
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
