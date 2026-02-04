import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRolle from './adminMedAlleAndreRollerOgsaSkruddPaRolle/adminMedAlleAndreRollerOgsaSkruddPaRolle'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

const test: string = 'Etterlever'

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  switch (test) {
    case 'Etterlever':
      return (
        <EtterleverRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Risikoeier':
      return (
        <RisikoeierRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Admin med alle andre roller ogsa skrudd pa':
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    default:
      return (
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
              Eksporter til Word
            </ActionMenu.Item>
          </ActionMenu.Content>
        </ActionMenu>
      )
  }

  return (
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
}
