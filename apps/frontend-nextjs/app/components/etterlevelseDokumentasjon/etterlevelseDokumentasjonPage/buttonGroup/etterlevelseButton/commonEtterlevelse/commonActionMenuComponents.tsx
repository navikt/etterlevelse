import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
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
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  children: string
}

export const RedigerEgenskaperActionMenuItem: FunctionComponent<
  TRedigerEgenskaperActionMenuItemProps
> = ({ etterlevelseDokumentasjon, children }) => (
  <ActionMenu.Item as='a' href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}>
    {children}
  </ActionMenu.Item>
)
