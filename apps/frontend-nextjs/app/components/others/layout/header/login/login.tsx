import { EPVO } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernombudetsTilbakemelding/personvernombudetsTilbakemeldingConstants'
import { adminAuditUrl } from '@/routes/admin/audit/auditRoutes'
import { adminDokumentrelasjonUrl } from '@/routes/admin/dokumentrelasjon/adminDokumentrelasjonRoutes'
import { adminDokumentasjonUrl } from '@/routes/admin/etterlevelseDokumentasjon/adminEtterlevelseDokumentasjonRoutes'
import { adminEtterlevelseUrl } from '@/routes/admin/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { adminCodelistUrl } from '@/routes/admin/kodeverk.ts/kodeverkRoutes'
import { adminKravUrl } from '@/routes/admin/krav/adminKravRoutes'
import { adminMaillog } from '@/routes/admin/maillog/maillogRoutes'
import { adminMessagesLogUrl } from '@/routes/admin/messagesLog/messagesLogRoutes'
import { adminPvkUrl } from '@/routes/admin/personvernkonsekvensvurdering/adminPersonvernkonsekvensvurderingRoutes'
import { adminVarselUrl } from '@/routes/admin/varsel/varselRoutes'
import { etterlevelseDokumentasjonerUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravlisteQueryUrl } from '@/routes/krav/kravRoutes'
import { loginUrl } from '@/routes/login/loginRoutes'
import { pvoOversiktUrl } from '@/routes/personvernombud/personvernombudetsRoutes'
import { user } from '@/services/user/userService'
import {
  BarChartIcon,
  DocPencilIcon,
  HouseIcon,
  InformationIcon,
  MenuHamburgerIcon,
  PersonIcon,
  ReceiptIcon,
} from '@navikt/aksel-icons'
import { Button, InternalHeader, Link } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from '../menu/menu'
import { ToggleActiveRole } from '../user/toggleActiveRole/toggleActiveRole'
import { UserInfoView } from '../user/userInfoView/userInfoView'

export const LoginHeaderButton = () => {
  // updates window.location on navigation
  const pathname: string = usePathname()
  const [fullUrl, setFullUrl] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href)
    }
  }, [])

  return (
    <InternalHeader.Button
      as={Link}
      href={loginUrl(fullUrl, pathname)}
      className='text-white'
      underline={false}
    >
      Logg inn
    </InternalHeader.Button>
  )
}

export const LoggedInHeader = () => {
  const pvoPages: {
    label: EPVO
    href: string
  }[] = user.isPersonvernombud()
    ? [
        {
          label: EPVO.overskrift,
          href: pvoOversiktUrl,
        },
      ]
    : []
  const kravPages: {
    label: string
    href: string
  }[] = user.isKraveier() ? [{ label: 'Forvalte og opprette krav', href: kravlisteQueryUrl() }] : []
  const adminPages: {
    label: string
    href: string
  }[] = user.isAdmin()
    ? [
        { label: 'Administrere krav', href: adminKravUrl },
        { label: 'Administrere dokumentasjon', href: adminDokumentasjonUrl },
        { label: 'Administrere dokument relasjon', href: adminDokumentrelasjonUrl },
        { label: 'Administrere etterlevelse', href: adminEtterlevelseUrl },
        { label: 'Administrere pvk dokument', href: adminPvkUrl },
        { label: 'Versjonering', href: adminAuditUrl() },
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

export const LoginButton = () => {
  // updates window.location on navigation
  const router: AppRouterInstance = useRouter()
  const pathname: string = usePathname()

  return (
    <Button
      as={Link}
      href={loginUrl(router.toString(), pathname)}
      className='text-white'
      underline={false}
    >
      Logg inn
    </Button>
  )
}
