import {
  BarChartIcon,
  DocPencilIcon,
  HouseIcon,
  InformationIcon,
  MenuHamburgerIcon,
  PersonIcon,
  ReceiptIcon,
} from '@navikt/aksel-icons'
import { Button, Dropdown, InternalHeader, Label, Link, Spacer } from '@navikt/ds-react'
import * as React from 'react'
import { useState } from 'react'
import { Location, useLocation } from 'react-router-dom'
import { writeLog } from '../api/LogApi'
import { getMeldingByType } from '../api/MeldingApi'
import { EAlertType, EMeldingStatus, EMeldingType, EPVO, IMelding } from '../constants'
import { user } from '../services/User'
import { useQueryParam } from '../util/hooks/customHooks'
import { intl } from '../util/intl/intl'
import { informationIcon, warningAlert } from './Images'
import { Markdown } from './common/Markdown'
import { Portrait } from './common/Portrait'
import {
  adminAuditUrl,
  adminCodelistUrl,
  adminDokumentasjonUrl,
  adminDokumentrelasjonUrl,
  adminEtterlevelseUrl,
  adminKravUrl,
  adminMaillog,
  adminMessagesLogUrl,
  adminPvkUrl,
  adminVarselUrl,
} from './common/RouteLinkAdmin'
import {
  etterlevelseDokumentasjonerUrl,
  temaUrl,
} from './common/RouteLinkEtterlevelsesdokumentasjon'
import { kravlisteUrl } from './common/RouteLinkKrav'
import { pvoOversiktUrl } from './common/RouteLinkPvo'
import SkipToContent from './common/SkipToContent/SkipToContent'
import ToggleActiveRole from './header/ToggleActiveRole'
import MainSearch from './search/MainSearch'

export const loginUrl = (location: Location, path?: string) => {
  const frontpage = window.location.href.substr(
    0,
    window.location.href.length - location.pathname.length
  )

  return `/login?redirect_uri=${frontpage}${path || ''}`
}

export const LoginHeaderButton = () => {
  // updates window.location on navigation
  const location = useLocation()
  return (
    <InternalHeader.Button
      as={Link}
      href={loginUrl(location, location.pathname)}
      className='text-white'
      underline={false}
    >
      Logg inn
    </InternalHeader.Button>
  )
}

export const LoginButton = () => {
  // updates window.location on navigation
  const location = useLocation()
  return (
    <Button
      as={Link}
      href={loginUrl(location, location.pathname)}
      className='text-white'
      underline={false}
    >
      Logg inn
    </Button>
  )
}

const LoggedInHeader = () => {
  const pvoPages = user.isPersonvernombud()
    ? [
        {
          label: EPVO.overskrift,
          href: pvoOversiktUrl,
        },
      ]
    : []
  const kravPages = user.isKraveier()
    ? [{ label: 'Forvalte og opprette krav', href: kravlisteUrl() }]
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
        { label: 'Administrere pvk dokument', href: adminPvkUrl },
        { label: intl.audit, href: adminAuditUrl() },
        { label: 'Kodeverk', href: adminCodelistUrl },
        { label: intl.questionAndAnswers, href: adminMessagesLogUrl },
        { label: intl.notifications, href: adminVarselUrl },
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

const getUserRole = () => {
  if (user.isAdmin()) return 'Admin'
  else if (user.isKraveier()) return 'Kraveier'
  else if (user.isPersonvernombud()) return 'Personverombud'
  else if (user.canWrite()) return 'Etterlever'
  else return 'Gjest'
}

const UserInfoView = () => {
  // const location = useLocation()
  // const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)
  // const path = location.pathname
  return (
    <div className='flex mb-4'>
      <Portrait ident={user.getIdent()} size={'3rem'} />
      <div className='flex flex-col ml-6'>
        <Label>{user.getName()}</Label>
        <Label size='small'>{getUserRole()}</Label>
      </div>
      {/* <div className="flex self-end ml-6">
        <Link href={`/logout?redirect_uri=${frontpage}${path}`}>Logg ut</Link>
      </div> */}
    </div>
  )
}

type TMenuItem = {
  label: React.ReactNode
  href?: string
  disabled?: boolean
  icon?: React.ReactNode
}

const Menu = (props: {
  pages: TMenuItem[][]
  title: React.ReactNode
  icon?: React.ReactNode
  kind?: 'secondary' | 'tertiary'
}) => {
  const allPages = props.pages.length
    ? props.pages
        .filter((page) => page.length)
        .reduce((previousValue, currentValue) => [
          ...((previousValue as TMenuItem[]) || []),
          { label: <Dropdown.Menu.Divider /> },
          ...(currentValue as TMenuItem[]),
        ])
    : []

  return (
    <Dropdown>
      <InternalHeader.Button as={Dropdown.Toggle}>
        {props.icon} {props.title}
      </InternalHeader.Button>
      <Dropdown.Menu className='min-w-max h-auto'>
        <Dropdown.Menu.List>
          {allPages.map((page, index) => {
            const item =
              !!page.href && !page.disabled ? (
                <Dropdown.Menu.List.Item
                  as={Link}
                  href={page.href}
                  onClick={() => {
                    // ampli.logEvent('navigere', {
                    //   kilde: 'header',
                    //   app: 'etterlevelse',
                    //   til: page.href,
                    //   fra: pathname,
                    // })
                  }}
                  underline={false}
                >
                  <div className='flex items-center'>
                    {page.icon && <div className='mr-2'>{page.icon}</div>}
                    {page.label}
                  </div>
                </Dropdown.Menu.List.Item>
              ) : (
                <Dropdown.Menu.GroupedList.Heading>{page.label}</Dropdown.Menu.GroupedList.Heading>
              )
            return (
              <div key={index} className='my-1'>
                {item}
              </div>
            )
          })}
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  )
}

let sourceReported = false

const Header = (props: { noSearchBar?: boolean; noLoginButton?: boolean }) => {
  const [systemVarsel, setSystemVarsel] = useState<IMelding>()
  const location = useLocation()
  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    writeLog('info', 'pageload', `pageload from ${source}`)
  }

  React.useEffect(() => {
    setTimeout(() => {
      if (!user.isLoggedIn()) {
        window.location.href = loginUrl(location, location.pathname)
      }
    }, 1000)
  }, [])

  React.useEffect(() => {
    ;(async () => {
      await getMeldingByType(EMeldingType.SYSTEM).then((r) => {
        if (r.numberOfElements > 0) {
          setSystemVarsel(r.content[0])
        }
      })
    })()
  }, [location.pathname])

  return (
    <div className='w-full'>
      <div className='w-full flex justify-center'>
        <SkipToContent />
        <InternalHeader className='w-full justify-center items-center'>
          <div className='max-w-7xl flex w-full'>
            <InternalHeader.Title href='/'>Støtte til etterlevelse</InternalHeader.Title>
            <Spacer />
            {!props.noSearchBar && (
              <div
                className='hidden lg:flex w-full max-w-xl justify-center items-center'
                role='search'
              >
                <MainSearch />
              </div>
            )}
            <Spacer />
            {!props.noLoginButton && (
              <div className='flex'>
                {!user.isLoggedIn() && <LoginHeaderButton />}
                {user.isLoggedIn() && <LoggedInHeader />}
              </div>
            )}
          </div>
        </InternalHeader>
      </div>
      <div
        className='flex lg:hidden bg-gray-900 py-1 px-1 w-full justify-center items-center'
        role='search'
      >
        <div className=' max-w-xl w-full '>
          <MainSearch />
        </div>
      </div>
      {systemVarsel && systemVarsel.meldingStatus === EMeldingStatus.ACTIVE && (
        <div className='w-full flex justify-center'>
          <div
            className={`flex
          flex-col
          items-center
          py-2
          border-b
          border-t
          w-full
          ${
            systemVarsel.alertType === 'INFO'
              ? 'bg-[#d8f9ff] border-[#66cbec]'
              : 'bg-[#ffeccc] border-[#ff9100]'
          }`}
            aria-label='Systemvarsel'
            role='status'
          >
            <div className='flex gap-2'>
              <div className='flex items-baseline pt-1'>
                <img
                  src={systemVarsel.alertType === EAlertType.INFO ? informationIcon : warningAlert}
                  width='18px'
                  height='18px'
                  alt={
                    systemVarsel.alertType === EAlertType.INFO ? 'information icon' : 'warning icon'
                  }
                />
              </div>
              <Markdown source={systemVarsel.melding} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
