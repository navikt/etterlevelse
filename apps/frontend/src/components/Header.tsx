import * as React from 'react'
import {useEffect, useState} from 'react'
import {ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList,} from 'baseui/header-navigation'
import {Block, BlockProps} from 'baseui/block'
import {Button, KIND, SIZE} from 'baseui/button'
import {StatefulPopover} from 'baseui/popover'
import {useHistory, useLocation} from 'react-router-dom'
import {StyledLink} from 'baseui/link'
import {useAwait, useQueryParam} from '../util/hooks'
import {paddingAll} from './common/Style'
import {theme} from '../util'
import {H1} from 'baseui/typography'
import {intl} from '../util/intl/intl'
import {StatefulMenu} from 'baseui/menu'
import {TriangleDown} from 'baseui/icon'
import BurgerMenu from './Navigation/Burger'
import RouteLink from './common/RouteLink'
import {ampli} from '../services/Amplitude'
import {user} from '../services/User'
import {writeLog} from '../api/LogApi'
import MainSearch from './search/MainSearch'
import {logo} from './Images'
import {maxPageWidth} from '../util/theme'
import {buttonBorderStyle} from './common/Button'

const LoginButton = (props: {location: string}) => {
  return (
    <StyledLink style={{textDecoration: 'none'}} href={`/login?redirect_uri=${props.location}`}>
      <Button size={SIZE.compact} kind={KIND.tertiary} $style={buttonBorderStyle}>
        <b>Logg inn</b>
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = (props: {location: string}) => {
  const blockStyle: BlockProps = {
    display: 'flex',
    width: '100%',
    ...paddingAll(theme.sizing.scale100)
  }
  return (
    <Block display='flex' justifyContent='center' alignItems='center'>
      <Block marginRight='14px'>
        {user.getIdent()}
      </Block>
      <Block {...blockStyle}>
        <StyledLink style={{textDecoration: 'none'}} href={`/logout?redirect_uri=${props.location}`}>
          <Button size={SIZE.compact} kind={KIND.tertiary} $style={buttonBorderStyle}>
            <b>Logg ut</b>
          </Button>
        </StyledLink>
      </Block>
    </Block>



    // <StatefulPopover
    //   content={
    //     <Block padding={theme.sizing.scale400}>
    //       <Label2 {...blockStyle}>Navn: {user.getName()}</Label2>
    //       {/* <Label2 {...blockStyle}>Grupper: {user.getGroupsHumanReadable().join(', ')}</Label2> */}
    //       {user.getIdent() && <Block {...blockStyle}>
    //         <RouteLink href={`/resource/${user.getIdent()}`}>Min side</RouteLink>
    //       </Block>}
    //       <Block {...blockStyle}>
    //         <RouteLink href={'/user/notifications'}>Mine varsler</RouteLink>
    //       </Block>
    //     </Block>
    //   }
    // >
    //   <Button kind="tertiary">{user.getIdent()}</Button>
    // </StatefulPopover>
  )
}

const AdminOptions = () => {
  const history = useHistory()
  const pages = [
    {label: intl.audit, href: '/admin/audit'},
    {label: 'Kodeverk', href: '/admin/codelist'},
    {label: intl.mailLog, href: '/admin/maillog'},
    {label: intl.settings, href: '/admin/settings'}
  ]
  return (
    <StatefulPopover
      content={({close}) =>
        <StatefulMenu
          items={pages}
          onItemSelect={select => {
            select.event?.preventDefault()
            close()
            history.push(select.item.href)
          }}
        />
      }>
      <Button endEnhancer={() => <TriangleDown size={24}/>} kind="tertiary">
        <b>{intl.administrate}</b>
      </Button>
    </StatefulPopover>
  )
}

let sourceReported = false

const Header = (props: {noSearchBar?: boolean, noLoginButton?: boolean}) => {
  const [url, setUrl] = useState(window.location.href)
  const location = useLocation()
  const source = useQueryParam('source')
  if (!sourceReported) {
    sourceReported = true
    writeLog('info', 'pageload', `pageload from ${source}`)
    if (source) {
      ampli.logEvent('etterlevelse_source', {source})
    }
  }

  useAwait(user.wait())

  useEffect(() => setUrl(window.location.href), [location.pathname])

  return (
    <Block width='100%' maxWidth={maxPageWidth}>
      <Block paddingLeft='40px' paddingRight='40px' width='calc(100%-80px)' height='76px' overrides={{Block: {props: {role: 'banner', 'aria-label': 'Header meny'}}}}>
        <HeaderNavigation overrides={{Root: {style: {paddingBottom: 0, borderBottomStyle: 'none'}}}}>

          <NavigationList $align={ALIGN.left} $style={{paddingLeft: 0}}>
            <NavigationItem $style={{paddingLeft: 0}}>
              <RouteLink href={'/'} hideUnderline>
                <H1 marginBottom={0} marginTop={0}>
                  <Block display='flex' alignItems='center'>
                    <img src={logo} alt='Nav etterlevelse' height='44px'/>
                  </Block>
                </H1>
              </RouteLink>
            </NavigationItem>
          </NavigationList>

          <NavigationList $style={{justifyContent: 'center'}}>
            {!props.noSearchBar && (<NavigationItem>
              <Block flex='1' display={['none', 'none', 'none', 'none', 'flex', 'flex']} overrides={{Block: {props: {role: 'search'}}}}>
                <MainSearch/>
              </Block>
            </NavigationItem>)}
          </NavigationList>

          {!props.noLoginButton && (<Block display={['none', 'none', 'none', 'none', 'none', 'flex']}>
            <NavigationList $align={ALIGN.right}>
              {user.isAdmin() && (
                <NavigationItem $style={{paddingLeft: 0}}>
                  <AdminOptions/>
                </NavigationItem>
              )}

              {!user.isLoggedIn() && (
                <NavigationItem $style={{paddingLeft: 0}}>
                  <LoginButton location={url}/>
                </NavigationItem>
              )}
              {user.isLoggedIn() && (
                <NavigationItem $style={{paddingLeft: 0}}>
                  <LoggedInHeader location={url}/>
                </NavigationItem>
              )}
            </NavigationList>
          </Block>)}
          <Block display={['block', 'block', 'block', 'block', 'block', 'none']}>
            <BurgerMenu/>
          </Block>
        </HeaderNavigation>
      </Block>
    </Block>
  )
}

export default Header
