import * as React from 'react'
import {useState} from 'react'
import {ALIGN, HeaderNavigation, HeaderNavigationProps, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList} from 'baseui/header-navigation'
import {Block} from 'baseui/block'
import {Button as BaseUIButton, KIND, SIZE} from 'baseui/button'
import Button, {buttonBorderStyle, buttonContentStyle} from './common/Button'
import {StatefulPopover} from 'baseui/popover'
import {Location, useLocation} from 'react-router-dom'
import {StyledLink} from 'baseui/link'
import {useQueryParam} from '../util/hooks'
import {theme} from '../util'
import {HeadingXLarge} from 'baseui/typography'
import {intl} from '../util/intl/intl'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import {user} from '../services/User'
import {writeLog} from '../api/LogApi'
import MainSearch from './search/MainSearch'
import {arkPennIcon, grafIcon, handWithLeaf, husIcon, informationIcon, logo, paragrafIcon, warningAlert} from './Images'
import {ettlevColors, maxPageWidth, responsivePaddingSmall, responsiveWidthSmall} from '../util/theme'
import {Checkbox, STYLE_TYPE} from 'baseui/checkbox'
import {Portrait} from './common/Portrait'
import {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import {faBars, faTimes} from '@fortawesome/free-solid-svg-icons'
import {faUser} from '@fortawesome/free-regular-svg-icons'
import SkipToContent from './common/SkipToContent/SkipToContent'
import {marginAll} from './common/Style'
import {AlertType, Melding, MeldingStatus, MeldingType} from '../constants'
import {getMeldingByType} from '../api/MeldingApi'
import {Markdown} from './common/Markdown'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {ampli} from '../services/Amplitude'
import {ChevronDownIcon, ChevronUpIcon} from '@navikt/aksel-icons'

export const loginUrl = (location: Location, path?: string) => {
  const frontpage = window.location.href.substr(0, window.location.href.length - location.pathname.length)

  return `/login?redirect_uri=${frontpage}${path || ''}`
}

export const LoginButton = () => {
  // updates window.location on navigation
  const location = useLocation()
  return (
    <StyledLink style={{ textDecoration: 'none' }} href={loginUrl(location, location.pathname)}>
      <Button kind={KIND.secondary} $style={buttonBorderStyle}>
        <strong>Logg inn</strong>
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = () => {
  const [viewRoller, setViewRoller] = useState(false)

  const roller = (
    <Block>
      <Button size={'xsmall'} kind={'underline-hover'} onClick={() => setViewRoller(!viewRoller)} icon={viewRoller ? <ChevronUpIcon/> : <ChevronDownIcon/>}>
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
      <Menu pages={[[{ label: <UserInfo /> }], kravPages, adminPages, [{ label: roller }]]} title={user.getIdent()} icon={faUser} kind={'tertiary'} />

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
          [{ label: 'Dokumentere etterlevelse', href: '/dokumentasjoner', icon: arkPennIcon }],
          [{ label: 'Status i organisasjonen', href: '//metabase.intern.nav.no/dashboard/116-dashboard-for-etterlevelse', icon: grafIcon }],
          [{ label: 'Forstå kravene', href: '/tema', icon: paragrafIcon }],
          [{ label: 'Mer om etterlevelse i NAV', href: '/help', icon: handWithLeaf }],
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

type MenuItem = { label: React.ReactNode; href?: string; disabled?: boolean; icon?: string }

const Menu = (props: { pages: MenuItem[][]; title: React.ReactNode; icon?: IconDefinition; kind?: 'primary' | 'secondary' | 'tertiary'; compact?: boolean }) => {
  const [open, setOpen] = useState(false)

  const pathname = window.location.pathname

  const allPages = props.pages.length
    ? props.pages
        .filter((p) => p.length)
        .reduce((previousValue, currentValue) => [...((previousValue as MenuItem[]) || []), { label: <Divider compact={props.compact} /> }, ...(currentValue as MenuItem[])])
    : []

  return (
    <StatefulPopover
      autoFocus
      returnFocus
      focusLock
      showArrow
      onClick={() => setOpen(!open)}
      onClose={() => setOpen(false)}
      overrides={{
        Arrow: { style: { backgroundColor: ettlevColors.white } },
        Body: { style: { ...marginAll(theme.sizing.scale900) } },
      }}
      content={
        <Block padding={theme.sizing.scale900} backgroundColor={ettlevColors.white} display={'flex'} flexDirection={'column'}>
          {allPages.map((p, i) => {
            const item =
              !!p.href && !p.disabled ? (
                <Block
                  display={'flex'}
                  alignItems={'center'}
                  $style={{
                    ':hover': {
                      textDecoration: '2px underline',
                    },
                  }}
                >
                  <RouteLink
                    href={p.href}
                    onClick={() => {
                      ampli.logEvent('navigere', { kilde: 'header', app: 'etterlevelse', til: p.href, fra: pathname })
                      setOpen(false)
                    }}
                    hideUnderline
                  >
                    <Block>
                      <Block display={'flex'} alignItems={'center'}>
                        {p.icon && (
                          <Block marginRight={theme.sizing.scale400}>
                            <img src={p.icon} alt={'link ikon'} aria-hidden />
                          </Block>
                        )}
                        <Block>{p.label}</Block>
                      </Block>
                    </Block>
                  </RouteLink>
                </Block>
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
      <BaseUIButton
        size={SIZE.compact}
        kind={props.kind || 'secondary'}
        overrides={
          props.kind !== 'tertiary'
            ? {
                BaseButton: {
                  style: {
                    ...buttonBorderStyle,
                    ...buttonContentStyle,
                    boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
                    ':hover': { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)' },
                    ':active': { boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)' },
                    ':focus': {
                      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                      outlineWidth: '3px',
                      outlineStyle: 'solid',
                      outlinwColor: ettlevColors.focusOutline,
                    },
                  },
                },
              }
            : {
                BaseButton: {
                  style: {
                    buttonContentStyle,
                  },
                },
              }
        }
      >
        {props.icon && <FontAwesomeIcon icon={open ? faTimes : props.icon} style={{ marginRight: '.5rem' }} fixedWidth />}
        {props.title}
      </BaseUIButton>
    </StatefulPopover>
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
    ;(async () => {
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
