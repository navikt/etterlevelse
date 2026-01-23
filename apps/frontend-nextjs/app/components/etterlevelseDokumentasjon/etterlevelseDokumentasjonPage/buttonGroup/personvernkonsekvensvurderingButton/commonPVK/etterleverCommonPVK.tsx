import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

/** Etterlever variants */

export const EtterleverVariantOne = () => (
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
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Beskriv art og omfang
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Vurder behov for PVK
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
        PVK
      </Button>
    </ActionMenu.Trigger>
    <ActionMenu.Content>
      <ActionMenu.Item as='a' href=''>
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Beskriv art og omfang
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Revurder behov for PVK
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantThree = () => (
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
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Beskriv art og omfang
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Påbegynn PVK
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Revurder behov for PVK
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantFour = () => (
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
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Beskriv art og omfang
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Fullfør PVK
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantFive = () => (
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
        Se behandlingens livsløp (read-only)
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

export const EtterleverVariantSix = () => (
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
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Se art og omfang (read-only)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Les PVOs tilbakemelding
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)

export const EtterleverVariantSeven = () => (
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
        Tegn behandlingens livsløp
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Beskriv art og omfang
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Les PVK (read-only, godkjent versjon) og Oppdater PVK (åpner neste versjon)
      </ActionMenu.Item>
      <ActionMenu.Item as='a' href=''>
        Revurder behov for PVK
      </ActionMenu.Item>
    </ActionMenu.Content>
  </ActionMenu>
)
