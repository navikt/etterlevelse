import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import EtterleverKnapper from './roller/etterlever/etterleverKnapper'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => (
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
      {/* Roller --> Tilstand */}
      <EtterleverKnapper etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
      <ActionMenu.Group label=''>
        <ActionMenu.Item
          as='a'
          href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
        >
          Rediger dokumentegenskaper
        </ActionMenu.Item>
      </ActionMenu.Group>
    </ActionMenu.Content>
  </ActionMenu>
)
