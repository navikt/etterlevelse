import * as React from 'react'
import { useState } from 'react'
import { Location, useLocation } from 'react-router-dom'
import { useQueryParam } from '../util/hooks'
import { intl } from '../util/intl/intl'
import { user } from '../services/User'
import { writeLog } from '../api/LogApi'
import MainSearch from './search/MainSearch'
import { informationIcon, logo, warningAlert } from './Images'
import { Portrait } from './common/Portrait'
import SkipToContent from './common/SkipToContent/SkipToContent'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { Markdown } from './common/Markdown'
import { ampli } from '../services/Amplitude'
import { BarChartIcon, ChevronDownIcon, ChevronUpIcon, DocPencilIcon, HouseIcon, InformationIcon, MenuHamburgerIcon, PersonIcon, ReceiptIcon } from '@navikt/aksel-icons'
import { Button, Checkbox, Dropdown, InternalHeader, Label, Link, Spacer } from '@navikt/ds-react'

export const loginUrl = (location: Location, path?: string) => {
  const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}

export const LoginButton = () => {
  // updates window.location on navigation
  const location = useLocation()
  return (
    <Link underline={false} href={loginUrl(location, location.pathname)}>
      <InternalHeader.Button as={Link} className="text-white" underline={false} >
        <strong>Logg inn</strong>
      </InternalHeader.Button>
    </Link>
  )
}

const LoggedInHeader = () => {
  const [viewRoller, setViewRoller] = useState(false)

  const roller = (
    <div>
      <Button size={'xsmall'} variant="tertiary" onClick={() => setViewRoller(!viewRoller)} icon={viewRoller ? <ChevronUpIcon /> : <ChevronDownIcon />}>
        Endre aktive roller
      </Button>
      <div className={`mt-2 ${viewRoller ? 'block' : 'hidden'}`}>
        {user.getAvailableGroups().map((g) => (
          <Checkbox key={g.group} checked={user.hasGroup(g.group)} onChange={(e) => user.toggleGroup(g.group, (e.target as HTMLInputElement).checked)}>
            {g.name}
          </Checkbox>
        ))}
      </div>
    </div>
  )

  const kravPages = user.isKraveier()
    ? [{ label: 'Forvalte og opprette krav', href: '/kravliste' },
    //{ label: 'Forvalte og opprette virkemiddel', href: '/virkemiddelliste' }
    ]
    : []
  const adminPages = user.isAdmin()
    ? [
      { label: 'Administrere krav', href: '/admin/krav' },
      { label: 'Administrere dokumentasjon', href: '/admin/dokumentasjon' },
      { label: 'Administrere etterlevelse', href: '/admin/etterlevelse' },
      { label: 'Administrere arkivering', href: '/admin/arkiv' },
      { label: intl.audit, href: '/admin/audit' },
      { label: 'Kodeverk', href: '/admin/codelist' },
      { label: intl.questionAndAnswers, href: '/admin/messageslog' },
      { label: intl.notifications, href: '/admin/varsel' },
      // { label: intl.settings, href: '/admin/settings', disabled: true },
    ]
    : []

  return (
    <div className="flex items-center justify-center">
      <Menu pages={[[{ label: <UserInfo /> }], kravPages, adminPages, [{ label: roller }]]} title={user.getIdent()} icon={<PersonIcon />} />

      <div className="w-3" />

      <Menu
        icon={<MenuHamburgerIcon />}
        pages={[
          [{ label: 'Forsiden', href: '/', icon: <HouseIcon /> }],
          [{ label: 'Dokumentere etterlevelse', href: '/dokumentasjoner', icon: <DocPencilIcon /> }],
          [{ label: 'Status i organisasjonen', href: '//metabase.intern.nav.no/dashboard/116-dashboard-for-etterlevelse', icon: <BarChartIcon /> }],
          [{ label: 'Forstå kravene', href: '/tema', icon: <ReceiptIcon /> }],
          [{ label: 'Mer om etterlevelse i NAV', href: '/omstottetiletterlevelse', icon: <InformationIcon /> }],
        ]}
        title={'Meny'}
      />

    </div>
  )
}

const UserInfo = () => {
  const location = useLocation()
  const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)
  const path = location.pathname
  return (
    <div className="flex mb-4">
      <Portrait ident={user.getIdent()} size={'48px'} />
      <div className="flex flex-col ml-6">
        <Label>{user.getName()}</Label>
        <Label size="small">{user.isAdmin() ? 'Admin' : user.isKraveier() ? 'Kraveier' : user.canWrite() ? 'Etterlever' : 'Gjest'}</Label>
      </div>
      <div className="flex self-end ml-6">
        <Link href={`/logout?redirect_uri=${frontpage}${path}`}>Logg ut</Link>
      </div>
    </div>
  )
}

type MenuItem = { label: React.ReactNode; href?: string; disabled?: boolean; icon?: React.ReactNode }

const Menu = (props: { pages: MenuItem[][]; title: React.ReactNode; icon?: React.ReactNode; kind?: 'secondary' | 'tertiary' }) => {
  const pathname = window.location.pathname

  const allPages = props.pages.length
    ? props.pages
      .filter((p) => p.length)
      .reduce((previousValue, currentValue) => [...((previousValue as MenuItem[]) || []), { label: <Dropdown.Menu.Divider /> }, ...(currentValue as MenuItem[])])
    : []

  return (
    <Dropdown>
      <InternalHeader.Button as={Dropdown.Toggle}>
        {props.icon} {props.title}
      </InternalHeader.Button>
      <Dropdown.Menu className="min-w-max h-auto">
        <Dropdown.Menu.List>
          {allPages.map((p, i) => {
            const item =
              !!p.href && !p.disabled ? (
                <Dropdown.Menu.List.Item
                  as={Link}
                  href={p.href}
                  onClick={() => {
                    ampli.logEvent('navigere', { kilde: 'header', app: 'etterlevelse', til: p.href, fra: pathname })
                  }}
                  underline={false}
                >
                  <div className="flex items-center">
                    {p.icon && <div className="mr-2">{p.icon}</div>}
                    {p.label}
                  </div>
                </Dropdown.Menu.List.Item>
              ) : (
                <Dropdown.Menu.GroupedList.Heading>{p.label}</Dropdown.Menu.GroupedList.Heading>
              )
            return (
              <div key={i} className="my-1">
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
  const [systemVarsel, setSystemVarsel] = useState<Melding>()
  const location = useLocation()

  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    writeLog('info', 'pageload', `pageload from ${source}`)
  }

  React.useEffect(() => {
    ; (async () => {
      await getMeldingByType(MeldingType.SYSTEM).then((r) => {
        if (r.numberOfElements > 0) {
          setSystemVarsel(r.content[0])
        }
      })
    })()
  }, [location.pathname])

  return (
    <div className="w-full">
      <div role="banner" className="w-full flex justify-center">
        <SkipToContent />
        <div className="w-full">
          <InternalHeader >
            <InternalHeader.Title href="/">
              Etterlevelse
            </InternalHeader.Title>
            <Spacer />
            {!props.noSearchBar && (
              <div className="flex w-full max-w-xl justify-center items-center" role="search">
                <MainSearch />
              </div>
            )}
            <Spacer />
            {!props.noLoginButton && (
              <div className="flex">
                {!user.isLoggedIn() && <LoginButton />}
                {user.isLoggedIn() && <LoggedInHeader />}
              </div>
            )}
          </InternalHeader>
        </div>
      </div>
      {systemVarsel && systemVarsel.meldingStatus === MeldingStatus.ACTIVE && (
        <div
          className={`flex flex-col items-center py-2 border-b border-t ${systemVarsel.alertType === 'INFO' ? 'bg-surface-info-subtle border-surface-info' : 'bg-surface-warning-subtle border-surface-warning'
            }`}
          aria-label="Systemvarsel"
          role="complementary"
        >
          <div className="flex gap-2">
            <img
              src={systemVarsel.alertType === AlertType.INFO ? informationIcon : warningAlert}
              width="20px"
              height="20px"
              alt={systemVarsel.alertType === AlertType.INFO ? 'information icon' : 'warning icon'}
            />
            <Markdown source={systemVarsel.melding} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
