import * as React from 'react'
import { useState } from 'react'
import { ALIGN, HeaderNavigation, HeaderNavigationProps, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList } from 'baseui/header-navigation'
import { Block } from 'baseui/block'
import Button from './common/Button'
import { Location, useLocation } from 'react-router-dom'
import { StyledLink } from 'baseui/link'
import { useQueryParam } from '../util/hooks'
import { theme } from '../util'
import { HeadingXLarge } from 'baseui/typography'
import { intl } from '../util/intl/intl'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import { user } from '../services/User'
import { writeLog } from '../api/LogApi'
import MainSearch from './search/MainSearch'
import { informationIcon, logo, warningAlert } from './Images'
import { ettlevColors, maxPageWidth, responsivePaddingSmall, responsiveWidthSmall } from '../util/theme'
import { Checkbox, STYLE_TYPE } from 'baseui/checkbox'
import { Portrait } from './common/Portrait'
import SkipToContent from './common/SkipToContent/SkipToContent'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { Markdown } from './common/Markdown'
import { ampli } from '../services/Amplitude'
import { BarChartIcon, ChevronDownIcon, ChevronUpIcon, DocPencilIcon, HouseIcon, InformationIcon, MenuHamburgerIcon, PersonIcon, ReceiptIcon } from '@navikt/aksel-icons'
import { Dropdown, Link } from '@navikt/ds-react'

export const loginUrl = (location: Location, path?: string) => {
  const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}

export const LoginButton = () => {
  // updates window.location on navigation
  const location = useLocation()
  return (
    <Link underline={false} href={loginUrl(location, location.pathname)}>
      <Button as="a" variant="secondary">
        <strong>Logg inn</strong>
      </Button>
    </Link>
  )
}

const LoggedInHeader = () => {
  const [viewRoller, setViewRoller] = useState(false)

  const roller = (
    <Block>
      <Button size={'xsmall'} variant="tertiary" onClick={() => setViewRoller(!viewRoller)} icon={viewRoller ? <ChevronUpIcon /> : <ChevronDownIcon />}>
        Endre aktive roller
      </Button>
      <Block display={viewRoller ? 'block' : 'none'} marginTop={theme.sizing.scale200}>
        {user.getAvailableGroups().map((g) => (
          <Checkbox
            key={g.group}
            checked={user.hasGroup(g.group)}
            checkmarkType={STYLE_TYPE.toggle_round}
            onChange={(e) => user.toggleGroup(g.group, (e.target as HTMLInputElement).checked)}
            labelPlacement={'right'}
            overrides={{
              Checkmark: {
                style: ({ $isFocused }) => ({
                  outlineColor: $isFocused ? ettlevColors.focusOutline : undefined,
                  outlineWidth: $isFocused ? '3px' : undefined,
                  outlineStyle: $isFocused ? 'solid' : undefined,
                }),
              },
            }}
          >
            {g.name}
          </Checkbox>
        ))}
      </Block>
    </Block>
  )

  const kravPages = user.isKraveier()
    ? [
      { label: 'Forvalte og opprette krav', href: '/kravliste' },
      { label: 'Forvalte og opprette virkemiddel', href: '/virkemiddelliste' },
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
    <Block display="flex" justifyContent="center" alignItems="center">
      <Menu pages={[[{ label: <UserInfo /> }], kravPages, adminPages, [{ label: roller }]]} title={user.getIdent()} icon={<PersonIcon />} kind={'tertiary'} />

      <Block width={theme.sizing.scale400} />

      <Menu
        icon={<MenuHamburgerIcon />}
        pages={[
          [
            {
              label: (
                <HeadingXLarge marginTop={0} marginBottom={theme.sizing.scale400}>
                  Støtte til etterlevelse
                </HeadingXLarge>
              ),
            },
          ],
          [{ label: 'Forsiden', href: '/', icon: <HouseIcon /> }],
          [{ label: 'Dokumentere etterlevelse', href: '/dokumentasjoner', icon: <DocPencilIcon /> }],
          [{ label: 'Status i organisasjonen', href: '//metabase.intern.nav.no/dashboard/116-dashboard-for-etterlevelse', icon: <BarChartIcon /> }],
          [{ label: 'Forstå kravene', href: '/tema', icon: <ReceiptIcon /> }],
          [{ label: 'Mer om etterlevelse i NAV', href: '/help', icon: <InformationIcon /> }],
        ]}
        compact
        title={'Meny'}
      />
    </Block>
  )
}

const Divider = (props: { compact?: boolean }) => (
  <Block minHeight={props.compact ? '5px' : '20px'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
    <Block $style={{ borderBottom: '1px solid ' + ettlevColors.green50 }} width={'100%'} />
  </Block>
)

const UserInfo = () => {
  const location = useLocation()
  const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)
  const path = location.pathname
  return (
    <Block display={'flex'} marginBottom={theme.sizing.scale600}>
      <Portrait ident={user.getIdent()} size={'48px'} />
      <Block display={'flex'} flexDirection={'column'} marginLeft={theme.sizing.scale800}>
        <Block
          $style={{
            fontWeight: 900,
            fontSize: '24px',
            lineHeight: '32px',
          }}
        >
          {user.getName()}
        </Block>
        <Block>{user.isAdmin() ? 'Admin' : user.isKraveier() ? 'Kraveier' : user.canWrite() ? 'Etterlever' : 'Gjest'}</Block>
      </Block>
      <Block alignSelf={'flex-end'} marginLeft={theme.sizing.scale800}>
        <StyledLink href={`/logout?redirect_uri=${frontpage}${path}`}>Logg ut</StyledLink>
      </Block>
    </Block>
  )
}

type MenuItem = { label: React.ReactNode; href?: string; disabled?: boolean; icon?: React.ReactNode }

const Menu = (props: { pages: MenuItem[][]; title: React.ReactNode; icon?: React.ReactNode; kind?: 'primary' | 'secondary' | 'tertiary'; compact?: boolean }) => {
  const pathname = window.location.pathname

  const allPages = props.pages.length
    ? props.pages
      .filter((p) => p.length)
      .reduce((previousValue, currentValue) => [...((previousValue as MenuItem[]) || []), { label: <Divider compact={props.compact} /> }, ...(currentValue as MenuItem[])])
    : []

  return (
      <Dropdown>
        <Button
          as={Dropdown.Toggle}
          variant={props.kind || 'secondary'}
          icon={props.icon}
        >
          {props.title}
        </Button>
        <Dropdown.Menu className="min-w-max h-auto">
          <Dropdown.Menu.List>
            {allPages.map((p, i) => {
              const item =
                !!p.href && !p.disabled ? (
                  <Dropdown.Menu.List.Item as={Link}
                    href={p.href}
                    onClick={() => {
                      ampli.logEvent('navigere', { kilde: 'header', app: 'etterlevelse', til: p.href, fra: pathname })
                    }}
                    underline={false}
                  >
                    <div className="flex items-center">
                      {p.icon && (
                        <div className="mr-2">
                          {p.icon}
                        </div>
                      )}
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

  const headerNavigationProps: HeaderNavigationProps = {
    overrides: { Root: { style: { borderBottomStyle: 'none', paddingBottom: '0px' } } },
  }
  return (
    <Block width="100%" backgroundColor={ettlevColors.white}>
      <Block overrides={{ Block: { props: { role: 'banner' } } }} width="100%" display="flex" backgroundColor={ettlevColors.white} justifyContent="center">
        <SkipToContent />
        <Block width="100%" maxWidth={maxPageWidth}>
          <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} width={responsiveWidthSmall} height="76px">
            <HeaderNavigation {...headerNavigationProps}>
              <NavigationList $align={ALIGN.left} $style={{ paddingLeft: 0 }}>
                <NavigationItem $style={{ paddingLeft: 0 }}>
                  <Block display="flex" alignItems="center" $style={{}}>
                    <RouteLink href={'/'} hideUnderline $style={{}}>
                      <img src={logo} alt="Nav etterlevelse" height="44px" />
                    </RouteLink>
                  </Block>
                </NavigationItem>
              </NavigationList>

              <NavigationList $align="center" $style={{ justifyContent: 'center' }}>
                {!props.noSearchBar && (
                  <NavigationItem $style={{ width: '100%', maxWidth: '600px' }}>
                    <Block flex="1" display='flex' overrides={{ Block: { props: { role: 'search' } } }}>
                      <MainSearch />
                    </Block>
                  </NavigationItem>
                )}
              </NavigationList>

              {!props.noLoginButton && (
                <Block display='flex'>
                  <NavigationList $align={ALIGN.right}>
                    {!user.isLoggedIn() && (
                      <NavigationItem $style={{ paddingLeft: 0 }}>
                        <LoginButton />
                      </NavigationItem>
                    )}
                    {user.isLoggedIn() && (
                      <NavigationItem $style={{ paddingLeft: 0 }}>
                        <LoggedInHeader />
                      </NavigationItem>
                    )}
                  </NavigationList>
                </Block>
              )}
              <Block display='none'>
                <BurgerMenu />
              </Block>
            </HeaderNavigation>
          </Block>
        </Block>
      </Block>
      {systemVarsel && systemVarsel.meldingStatus === MeldingStatus.ACTIVE && (
        <div
          className={`flex flex-col items-center py-2 border-b border-t ${systemVarsel.alertType === 'INFO' ? 'bg-surface-info-subtle border-surface-info' : 'bg-surface-warning-subtle border-surface-warning'}`}
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
    </Block>
  )
}

export default Header
