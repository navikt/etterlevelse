import { etterlevelsesDokumentasjonEditUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

export const ActionMenuButtonEtterlevelse = () => (
  <ActionMenu.Trigger>
    <Button variant='secondary-neutral' icon={<ChevronDownIcon aria-hidden />} iconPosition='right'>
      Etterlevelse
    </Button>
  </ActionMenu.Trigger>
)

type TRedigerEgenskaperActionMenuItemProps = {
  etterlevelseDokumentasjonId: string
}

export const RedigerEgenskaperActionMenuItem: FunctionComponent<
  TRedigerEgenskaperActionMenuItemProps
> = ({ etterlevelseDokumentasjonId }) => (
  <ActionMenu.Item as='a' href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjonId)}>
    Rediger dokumentegenskaper
  </ActionMenu.Item>
)
