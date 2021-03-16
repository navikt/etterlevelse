import * as React from 'react'
import {Menu} from 'baseui/icon'
import Button from '../../common/Button'
import {ANCHOR, Drawer} from 'baseui/drawer'
import {theme} from '../../../util'
import {Block, BlockProps} from 'baseui/block'
import {StyledLink} from 'baseui/link'
import {H6, Paragraph2, Paragraph4} from 'baseui/typography'
import RouteLink, {ExternalLink} from '../../common/RouteLink'
import NavLogo from '../../../resources/navlogo.svg'
import {useLocation} from 'react-router-dom'
import SlackLogo from '../../../resources/Slack_Monochrome_White.svg'
import {env} from '../../../util/env'
import {useStyletron} from 'styletron-react'
import {user} from '../../../services/User'
import {useAwait} from '../../../util/hooks'
import {intl} from '../../../util/intl/intl'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronDown, faChevronRight} from '@fortawesome/free-solid-svg-icons'
import {datajegerSlackLink, documentationLink} from '../../../util/config'

const drawerFooterProps: BlockProps = {
  display: 'flex',
  width: '100%',
  height: '100%',
  bottom: '0',
  alignItems: 'flex-end',
  marginTop: theme.sizing.scale800
}

const Brand = () =>
  <StyledLink style={{textDecoration: 'none'}} href="/">
    <H6 color="white" marginBottom="2rem">Etterlevelse</H6>
  </StyledLink>

const NavItem = (props: {to: string, text: string}) =>
  <RouteLink href={props.to} style={{textDecoration: 'none'}}>
    <Block display="flex" alignItems="center">
      <Block marginRight={theme.sizing.scale500}>
        <FontAwesomeIcon
          icon={useLocation().pathname.split('/')[1].includes(props.to.split('/')[1]) ? faChevronDown : faChevronRight}
          color="white"
          size="lg"
        />
      </Block>


      <Paragraph2 color="white">{props.text}</Paragraph2>
    </Block>
  </RouteLink>

const LoginButton = (props: {location: string}) => {
  const [useCss] = useStyletron()
  const linkCss = useCss({textDecoration: 'none', color: 'white'})
  return (
    <StyledLink href={`${env.backendBaseUrl}/login?redirect_uri=${props.location}`} className={linkCss}>
      <Button kind="secondary">
        Logg inn
      </Button>
    </StyledLink>
  )
}

const SignOutButton = (props: {location: string}) => {
  const [useCss] = useStyletron()
  const linkCss = useCss({textDecoration: 'none', color: 'white'})
  return (
    <StyledLink href={`${env.backendBaseUrl}/logout?redirect_uri=${props.location}`} className={linkCss}>
      <Button kind="secondary">
        Logg ut
      </Button>
    </StyledLink>
  )
}

const BurgerMenu = () => {
  const location = useLocation()
  const [showMenu, setShowMenu] = React.useState<boolean>(false)
  const [url, setUrl] = React.useState(window.location.href)

  useAwait(user.wait())

  React.useEffect(() => {
    if (showMenu) setShowMenu(false)
    setUrl(window.location.href)
  }, [location.pathname])


  return (
    <React.Fragment>
      {!showMenu && <Button kind="minimal" onClick={() => setShowMenu(true)}><Menu size={36}/></Button>}

      {showMenu && (
        <Drawer
          isOpen={showMenu}
          autoFocus
          onClose={() => setShowMenu(false)}
          anchor={ANCHOR.top}
          overrides={{
            DrawerContainer: {
              style: () => {
                return {
                  backgroundColor: theme.colors.primaryA,
                  height: 'auto'
                }
              }
            },
            Close: {
              style: ({$theme}) => {
                return {
                  backgroundColor: 'white'
                }
              }
            }
          }}
        >
          <Block display="flex" flexDirection="column" alignItems="center" height="100%">
            <Brand/>
            <Block>

              {user.isAdmin() && (
                <>
                  <NavItem to="/admin/audit" text={intl.audit}/>
                  <NavItem to="/admin/settings" text={intl.settings}/>
                </>
              )}
            </Block>

            <Block display="flex" justifyContent="center" marginTop={theme.sizing.scale1000}>
              {!user.isLoggedIn() && (
                <LoginButton location={url}/>
              )}

              {user.isLoggedIn() && (
                <>
                  <Block display="flex" alignItems="center" flexDirection="column">
                    <Block>
                      <Paragraph2 color="white"><b>{user.getIdent()}</b> - {user.getName()}</Paragraph2>
                    </Block>
                    <Block>
                      <SignOutButton location={url}/>
                    </Block>
                  </Block>
                </>
              )}

            </Block>

            <Block {...drawerFooterProps}>
              <Block width={'100%'}>
                <ExternalLink href={datajegerSlackLink} hideUnderline>
                  <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
                    <img src={SlackLogo} width="60px" alt="slack logo"/>
                    <Paragraph4 color={theme.colors.white}>#datajegerne </Paragraph4>
                  </Block>
                </ExternalLink>
              </Block>
              <Block width={'100%'}>
                <ExternalLink href={documentationLink} hideUnderline>
                  <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
                    <Paragraph4 color={theme.colors.white}>Dokumentasjon </Paragraph4>
                  </Block>
                </ExternalLink>
              </Block>
            </Block>
            <Block paddingBottom={theme.sizing.scale600} display={'flex'} justifyContent={'center'}>
              <img src={NavLogo} alt='NAV logo' width="50%"/>
            </Block>
          </Block>
        </Drawer>
      )}
    </React.Fragment>


  )
}

export default BurgerMenu
