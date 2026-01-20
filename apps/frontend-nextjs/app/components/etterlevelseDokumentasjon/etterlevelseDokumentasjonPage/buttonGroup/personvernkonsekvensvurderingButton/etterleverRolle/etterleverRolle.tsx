import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const EtterleverRolle: FunctionComponent = (
  {
    //   etterlevelseDokumentasjon,
    //   behandlingsLivslop,
    //   pvkDokument,
    //   risikoscenarioList,
    //   isRisikoeier,
  }
) => (
  <>
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
        <ActionMenu.Group label=''>
          <ActionMenu.Item as='a' href=''>
            Beskriv art og omfang
          </ActionMenu.Item>
          <ActionMenu.Item as='a' href=''>
            Fullfør PVK
          </ActionMenu.Item>
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu>
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
          See behandlingens livsløp (read-only)
        </ActionMenu.Item>
        <ActionMenu.Group label=''>
          <ActionMenu.Item as='a' href=''>
            Se art og omfang (read-only)
          </ActionMenu.Item>
          <ActionMenu.Item as='a' href=''>
            Les PVK (read-only)
          </ActionMenu.Item>
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu>
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
  </>
)

export default EtterleverRolle
