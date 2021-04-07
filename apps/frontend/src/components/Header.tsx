import * as React from 'react'
import { useEffect, useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList, } from 'baseui/header-navigation'
import { Block, BlockProps } from 'baseui/block'
import { Button } from 'baseui/button'
import { StatefulPopover } from 'baseui/popover'
import { useHistory, useLocation } from 'react-router-dom'
import { StyledLink } from 'baseui/link'
import { useAwait, useQueryParam } from '../util/hooks'
import { paddingAll } from './common/Style'
import { theme } from '../util'
import { H1, Label2 } from 'baseui/typography'
import { intl } from '../util/intl/intl'
import { StatefulMenu } from 'baseui/menu'
import { TriangleDown } from 'baseui/icon'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import { ampli } from '../services/Amplitude'
import { user } from '../services/User'
import { writeLog } from '../api/LogApi'
import MainSearch from './search/MainSearch'
import { logo } from './Images'



const LoginButton = (props: { location: string }) => {
  return (
    <StyledLink href={`/login?redirect_uri=${props.location}`}>
      <Button $style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        Logg inn
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = (props: { location: string }) => {
  const blockStyle: BlockProps = {
    display: 'flex',
    width: '100%',
    ...paddingAll(theme.sizing.scale100)
  }
  return (
    <StatefulPopover
      content={
        <Block padding={theme.sizing.scale400}>
          <Label2 {...blockStyle}>Navn: {user.getName()}</Label2>
          {/* <Label2 {...blockStyle}>Grupper: {user.getGroupsHumanReadable().join(', ')}</Label2> */}
          {user.getIdent() && <Block {...blockStyle}>
            <RouteLink href={`/resource/${user.getIdent()}`}>Min side</RouteLink>
          </Block>}
          <Block {...blockStyle}>
            <RouteLink href={'/user/notifications'}>Mine varsler</RouteLink>
          </Block>
          <Block {...blockStyle}>
            <StyledLink href={`/logout?redirect_uri=${props.location}`}>
              Logg ut
            </StyledLink>
          </Block>
        </Block>
      }
    >
      <Button kind="tertiary">{user.getIdent()}</Button>
    </StatefulPopover>
  )
}

const AdminOptions = () => {
  const history = useHistory()
  const pages = [
    { label: intl.audit, href: '/admin/audit' },
    { label: 'Kodeverk', href: '/admin/codelist' },
    { label: intl.mailLog, href: '/admin/maillog' },
    { label: intl.settings, href: '/admin/settings' }
  ]
  return (
    <StatefulPopover
      content={({ close }) =>
        <StatefulMenu
          items={pages}
          onItemSelect={select => {
            select.event?.preventDefault()
            close()
            history.push(select.item.href)
          }}
        />
      }>
      <Button endEnhancer={() => <TriangleDown size={24} />} kind="tertiary">
        {intl.administrate}
      </Button>
    </StatefulPopover>
  )
}

let sourceReported = false

const Header = (props: { noSearchBar?: boolean, noLoginButton?: boolean }) => {
  const [url, setUrl] = useState(window.location.href)
  const location = useLocation()
  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    writeLog('info', 'pageload', `pageload from ${source}`)
    if (source) {
      ampli.logEvent('etterlevelse_source', { source })
    }
  }

  useAwait(user.wait())

  useEffect(() => setUrl(window.location.href), [location.pathname])

  return (
    <Block height='76px' width='100%' overrides={{ Block: { props: { role: 'banner', 'aria-label': 'Header meny' } } }}>
      <HeaderNavigation overrides={{ Root: { style: { paddingBottom: 0, borderBottomStyle: 'none' } } }}>
        <Block display={['block', 'block', 'none', 'none']}>
          <BurgerMenu />
        </Block>


        <NavigationList $align={ALIGN.left} $style={{ paddingLeft: 0 }}>
          <NavigationItem $style={{ paddingLeft: 0 }}>
            <RouteLink href={'/'} hideUnderline>
              <Block alignContent='center' backgroundColor='yellow'>
                <H1 marginBottom={0} marginTop={0}>
                  <img src={logo} alt='Nav etterlevelse' height='44px' />
                </H1>
              </Block>
            </RouteLink>
          </NavigationItem>
          {!props.noSearchBar && (<NavigationItem>
            <Block overrides={{ Block: { props: { role: 'search' } } }}>
              <MainSearch />
            </Block>
          </NavigationItem>)}
        </NavigationList>

        <NavigationList $align={ALIGN.center} />

        {!props.noLoginButton && (<Block display={['none', 'none', 'flex', 'flex']}>
          <NavigationList $align={ALIGN.right}>
            {user.isAdmin() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <AdminOptions />
              </NavigationItem>
            )}

            {!user.isLoggedIn() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <LoginButton location={url} />
              </NavigationItem>
            )}
            {user.isLoggedIn() && (
              <NavigationItem $style={{ paddingLeft: 0 }}>
                <LoggedInHeader location={url} />
              </NavigationItem>
            )}
          </NavigationList>
        </Block>)}

      </HeaderNavigation>
    </Block>
  )
}

export default Header
