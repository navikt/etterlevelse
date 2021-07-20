import * as React from 'react'
import { useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList } from 'baseui/header-navigation'
import { Block } from 'baseui/block'
import { KIND, SIZE } from 'baseui/button'
import Button, { ButtonKind } from '../components/common/Button'
import { Popover } from 'baseui/popover'
import { useHistory } from 'react-router-dom'
import { StyledLink } from 'baseui/link'
import { useQueryParam } from '../util/hooks'
import { theme } from '../util'
import { H1, HeadingXLarge } from 'baseui/typography'
import { intl } from '../util/intl/intl'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'
import { writeLog } from '../api/LogApi'
import MainSearch from './search/MainSearch'
import { arkPennIcon, grafIcon, husIcon, logo, paragrafIcon } from './Images'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { buttonBorderStyle } from './common/Button'
import { Checkbox } from 'baseui/checkbox'
import { Portrait } from './common/Portrait'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faBars, faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-regular-svg-icons'
import { History } from 'history'

export const loginUrl = (history: History, path?: string) => {
  const frontpage = window.location.href.substr(0, window.location.href.length - history.location.pathname.length)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}

const LoginButton = () => {
  // updates window.location on navigation
  const history = useHistory()
  return (
    <StyledLink style={{ textDecoration: 'none' }} href={loginUrl(history)}>
      <Button size={SIZE.compact} kind={KIND.secondary} $style={buttonBorderStyle}>
        <b>Logg inn</b>
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = () => {
  const [viewRoller, setViewRoller] = useState(false)

  const roller = (
    <Block>
      <Button size={'mini'} kind={'underline-hover'} onClick={() => setViewRoller(!viewRoller)} icon={viewRoller ? faChevronUp : faChevronDown}>
        Endre aktive roller
      </Button>
      <Block display={viewRoller ? 'block' : 'none'} marginTop={theme.sizing.scale200}>
        {user.getAvailableGroups().map((g) => (
          <Checkbox
            key={g.group}
            checked={user.hasGroup(g.group)}
            checkmarkType={'toggle_round'}
            onChange={(e) => user.toggleGroup(g.group, (e.target as HTMLInputElement).checked)}
            labelPlacement={'right'}
          >
            {g.name}
          </Checkbox>
        ))}
      </Block>
    </Block>
  )

  const kravPages = user.isKraveier() ? [{ label: 'Forvalte og opprette krav', href: '/krav' }] : []
  const adminPages = user.isAdmin()
    ? [
        { label: intl.audit, href: '/admin/audit' },
        { label: 'Kodeverk', href: '/admin/codelist' },
        { label: intl.mailLog, href: '/admin/maillog' },
        { label: intl.settings, href: '/admin/settings', disabled: true },
      ]
    : []
  const otherPages = [
    { label: 'Mine instillinger', href: '/instillinger', disabled: true },
    { label: 'Hjelp', href: '/hjelp', disabled: true },
  ]

  return (
    <Block display="flex" justifyContent="center" alignItems="center">
      <Menu pages={[[{ label: <UserInfo /> }], kravPages, adminPages, otherPages, [{ label: roller }]]} title={user.getIdent()} icon={faUser} kind={'tertiary'} />

      <Block width={theme.sizing.scale400} />

      <Menu
        icon={faBars}
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
          [{ label: 'Forsiden', href: '/', icon: husIcon }],
          [{ label: 'Dokumentere etterlevelse', href: '/behandlinger', icon: arkPennIcon }],
          [{ label: 'Status i organisasjonen', href: '/status', icon: grafIcon }],
          [{ label: 'Les kravene', href: '/tema', icon: paragrafIcon }],
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
  const history = useHistory()
  const frontpage = window.location.href.substr(0, window.location.href.length - history.location.pathname.length)
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
        <StyledLink href={`/logout?redirect_uri=${frontpage}`}>Logg ut</StyledLink>
      </Block>
    </Block>
  )
}

type MenuItem = { label: React.ReactNode; href?: string; disabled?: boolean; icon?: string }

const Menu = (props: { pages: MenuItem[][]; title: React.ReactNode; icon?: IconDefinition; kind?: ButtonKind; compact?: boolean }) => {
  const [open, setOpen] = useState(false)

  const allPages = props.pages.length
    ? props.pages
        .filter((p) => p.length)
        .reduce((previousValue, currentValue) => [...((previousValue as MenuItem[]) || []), { label: <Divider compact={props.compact} /> }, ...(currentValue as MenuItem[])])
    : []

  return (
    <Popover
      autoFocus
      returnFocus
      focusLock
      isOpen={open}
      showArrow
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}
      overrides={{
        Arrow: { style: { backgroundColor: ettlevColors.white } },
        Body: { style: { margin: theme.sizing.scale900 } },
      }}
      content={
        <Block padding={theme.sizing.scale900} backgroundColor={ettlevColors.white} display={'flex'} flexDirection={'column'}>
          {allPages.map((p, i) => {
            const item =
              !!p.href && !p.disabled ? (
                <RouteLink href={p.href} onClick={() => setOpen(false)}>
                  <Block display={'flex'} alignItems={'center'}>
                    {p.icon && (
                      <Block marginRight={theme.sizing.scale400}>
                        <img src={p.icon} alt={'link ikon'} aria-hidden />
                      </Block>
                    )}
                    <Block>{p.label}</Block>
                  </Block>
                </RouteLink>
              ) : (
                <Block $style={{ opacity: p.disabled ? 0.6 : 1 }}>{p.label}</Block>
              )
            return (
              <Block key={i} marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100}>
                {item}
              </Block>
            )
          })}
        </Block>
      }
    >
      <Block>
        <Button size={SIZE.compact} kind={props.kind || 'secondary'} icon={open ? faTimes : props.icon} onClick={() => setOpen(!open)}>
          {props.title}
        </Button>
      </Block>
    </Popover>
  )
}

let sourceReported = false

const Header = (props: { noSearchBar?: boolean; noLoginButton?: boolean }) => {
  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    writeLog('info', 'pageload', `pageload from ${source}`)
    if (source) {
      ampli.logEvent('etterlevelse_source', { source })
    }
  }

  return (
    <Block width="100%" display="flex" backgroundColor={ettlevColors.white} justifyContent="center">
      <Block width="100%" maxWidth={maxPageWidth}>
        <Block paddingLeft="40px" paddingRight="40px" width="calc(100%-80px)" height="76px" overrides={{ Block: { props: { role: 'banner', 'aria-label': 'Header meny' } } }}>
          <HeaderNavigation overrides={{ Root: { style: { paddingBottom: 0, borderBottomStyle: 'none' } } }}>
            <NavigationList $align={ALIGN.left} $style={{ paddingLeft: 0 }}>
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <RouteLink href={'/'} hideUnderline>
                  <H1 marginBottom={0} marginTop={0}>
                    <Block display="flex" alignItems="center">
                      <img src={logo} alt="Nav etterlevelse" height="44px" />
                    </Block>
                  </H1>
                </RouteLink>
              </NavigationItem>
            </NavigationList>

            <NavigationList $style={{ justifyContent: 'center' }}>
              {!props.noSearchBar && (
                <NavigationItem $style={{ width: '100%', maxWidth: '600px' }}>
                  <Block flex="1" display={['none', 'none', 'none', 'none', 'flex', 'flex']} overrides={{ Block: { props: { role: 'search' } } }}>
                    <MainSearch />
                  </Block>
                </NavigationItem>
              )}
            </NavigationList>

            {!props.noLoginButton && (
              <Block display={['none', 'none', 'none', 'none', 'none', 'flex']}>
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
            <Block display={['block', 'block', 'block', 'block', 'block', 'none']}>
              <BurgerMenu />
            </Block>
          </HeaderNavigation>
        </Block>
      </Block>
    </Block>
  )
}

export default Header
