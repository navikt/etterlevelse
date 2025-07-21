import { EPVO } from '@/constants/personvernkonsekvensevurdering/personvernombud/constants'
import { adminAuditUrl } from '@/routes/admin/audit/routes'
import { adminDokumentrelasjonUrl } from '@/routes/admin/dokumentrelasjon/routes'
import {
  adminEtterlevelseUrl,
  adminMaillog,
  adminMessagesLogUrl,
  adminVarselUrl,
} from '@/routes/admin/etterlevelse/routes'
import { adminCodelistUrl } from '@/routes/admin/routes'
import { temaUrl } from '@/routes/common/teamkatalogen/routes'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelse/dokumentasjoner/routes'
import { adminDokumentasjonUrl, adminKravUrl } from '@/routes/kraveier/admin/components'
import { kravlisteUrl } from '@/routes/kraveier/routes'
import { loginUrl } from '@/routes/other/login/routes'
import { pvoOversiktUrl } from '@/routes/personvernkonsekvensevurdering/personvernombud/routes'
import { user } from '@/services/user/user'
import {
  BarChartIcon,
  DocPencilIcon,
  HouseIcon,
  InformationIcon,
  MenuHamburgerIcon,
  PersonIcon,
  ReceiptIcon,
} from '@navikt/aksel-icons'
import { InternalHeader, Link } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { Menu } from '../menu/menu'
import { ToggleActiveRole } from '../user/toggleActiveRole/toggleActiveRole'
import { UserInfoView } from '../user/userInfoView/userInfoView'

export const LoginHeaderButton = () => {
  // updates window.location on navigation
  const pathname: string = usePathname()

  return (
    <InternalHeader.Button
      as={Link}
      href={loginUrl(window.location.href, pathname)}
      className='text-white'
      underline={false}
    >
      Logg inn
    </InternalHeader.Button>
  )
}

export const LoggedInHeader = () => {
  const pvoPages = user.isPersonvernombud()
    ? [
        {
          label: EPVO.overskrift,
          href: pvoOversiktUrl,
        },
      ]
    : []
  const kravPages = user.isKraveier()
    ? [
        { label: 'Forvalte og opprette krav', href: kravlisteUrl() },
        //{ label: 'Forvalte og opprette virkemiddel', href: virkemiddellisteUrl }
      ]
    : []
  const adminPages: {
    label: string
    href: string
  }[] = user.isAdmin()
    ? [
        { label: 'Administrere krav', href: adminKravUrl },
        { label: 'Administrere dokumentasjon', href: adminDokumentasjonUrl },
        { label: 'Administrere dokument relasjon', href: adminDokumentrelasjonUrl },
        { label: 'Administrere etterlevelse', href: adminEtterlevelseUrl },
        { label: 'Audit', href: adminAuditUrl() },
        { label: 'Kodeverk', href: adminCodelistUrl },
        { label: 'Spørsmål og svar', href: adminMessagesLogUrl },
        { label: 'Varslinger', href: adminVarselUrl },
        { label: 'Sendt e-post log', href: adminMaillog },
        // { label: intl.settings, href: '/admin/settings', disabled: true },
      ]
    : []

  return (
    <div className='flex items-center justify-center'>
      <Menu
        pages={[
          [{ label: <UserInfoView /> }],
          kravPages,
          pvoPages,
          adminPages,
          [{ label: <ToggleActiveRole /> }],
        ]}
        title={user.getIdent()}
        icon={<PersonIcon area-label='' aria-hidden />}
      />

      <div className='w-3' />

      <Menu
        icon={<MenuHamburgerIcon area-label='' aria-hidden />}
        pages={[
          [{ label: 'Forsiden', href: '/', icon: <HouseIcon area-label='' aria-hidden /> }],
          [
            {
              label: 'Dokumentere etterlevelse',
              href: etterlevelseDokumentasjonerUrl(),
              icon: <DocPencilIcon area-label='' aria-hidden />,
            },
          ],
          [
            {
              label: 'Status i organisasjonen',
              href: '//metabase.ansatt.nav.no/dashboard/116-dashboard-for-etterlevelse',
              icon: <BarChartIcon area-label='' aria-hidden />,
            },
          ],
          [
            {
              label: 'Forstå kravene',
              href: temaUrl,
              icon: <ReceiptIcon area-label='' aria-hidden />,
            },
          ],
          [
            {
              label: 'Mer om etterlevelse i Nav',
              href: '/omstottetiletterlevelse',
              icon: <InformationIcon area-label='' aria-hidden />,
            },
          ],
        ]}
        title='Meny'
      />
    </div>
  )
}
