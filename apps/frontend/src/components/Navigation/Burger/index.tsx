import * as React from 'react'
import { Menu } from 'baseui/icon'
import Button from '../../common/Button'
import { ANCHOR, Drawer } from 'baseui/drawer'
import { theme } from '../../../util'
import { Block, BlockProps } from 'baseui/block'
import { StyledLink } from 'baseui/link'
import { H2, H6, Paragraph2, Paragraph4 } from 'baseui/typography'
import RouteLink, { ExternalLink } from '../../common/RouteLink'
import NavLogo from '../../../resources/navlogo.svg'
import { useLocation } from 'react-router-dom'
import SlackLogo from '../../../resources/Slack_Monochrome_White.svg'
import { env } from '../../../util/env'
import { useStyletron } from 'styletron-react'
import { user } from '../../../services/User'
import { intl } from '../../../util/intl/intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faChevronDown, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons'
import { datajegerSlackLink, documentationLink } from '../../../util/config'
import { ettlevColors } from '../../../util/theme'
import { arkPennIcon, exitIcon, grafIcon, husIcon, paragrafIcon } from '../../Images'

const drawerFooterProps: BlockProps = {
  display: 'flex',
  width: '100%',
  height: '100%',
  bottom: '0',
  alignItems: 'flex-end',
  marginTop: theme.sizing.scale800,
}

const Brand = () => (
  <StyledLink style={{ textDecoration: 'none' }} href="/">
    <H2 color={ettlevColors.green800}>
      Støtte til etterlevelse
    </H2>
  </StyledLink>
)

const MenuItem = (props: { to: string; text: string; icon: string, setShowMenu: Function }) => (
  <Block
    display={'flex'}
    alignItems={'center'}
    $style={{
      ':hover': {
        textDecoration: '2px underline',
      },
    }}
  >
    <RouteLink href={props.to} hideUnderline onClick={() => props.setShowMenu(false)}>
      <Block>
        <Block display={'flex'} alignItems={'center'}>
          {props.icon && (
            <Block marginRight={theme.sizing.scale400}>
              <img src={props.icon} alt={'link ikon'} aria-hidden />
            </Block>
          )}
          <Block>{props.text}</Block>
        </Block>
      </Block>
    </RouteLink>
  </Block>
)

const NavItem = (props: { to: string; text: string }) => (
  <RouteLink href={props.to} style={{ textDecoration: 'none' }}>
    <Block display="flex" alignItems="center">
      <Block marginRight={theme.sizing.scale500}>
        <FontAwesomeIcon icon={useLocation().pathname.split('/')[1].includes(props.to.split('/')[1]) ? faChevronDown : faChevronRight} color="white" size="lg" />
      </Block>

      <Paragraph2 color={ettlevColors.green800}>{props.text}</Paragraph2>
    </Block>
  </RouteLink>
)

const LoginButton = (props: { location: string }) => {
  const [useCss] = useStyletron()
  const linkCss = useCss({ textDecoration: 'none', color: 'white' })
  return (
    <StyledLink href={`${env.backendBaseUrl}/login?redirect_uri=${props.location}`} className={linkCss}>
      <Button kind="secondary">Logg inn</Button>
    </StyledLink>
  )
}

const SignOutButton = (props: { location: string }) => {
  const [useCss] = useStyletron()
  const linkCss = useCss({ textDecoration: 'none', color: 'white' })
  return (
    <StyledLink href={`${env.backendBaseUrl}/logout?redirect_uri=${props.location}`} className={linkCss}>
      <Button kind="secondary" startEnhancer={<img src={exitIcon} alt="" />}>Logg ut</Button>
    </StyledLink>
  )
}

const BurgerMenu = () => {
  const location = useLocation()
  const [showMenu, setShowMenu] = React.useState<boolean>(false)
  const [url, setUrl] = React.useState(window.location.href)

  React.useEffect(() => {
    if (showMenu) setShowMenu(false)
    setUrl(window.location.href)
  }, [location.pathname])

  return (
    <React.Fragment>
      {!showMenu && (
        <Button kind="secondary" size="compact" onClick={() => setShowMenu(true)} icon={faBars}>
          Meny
        </Button>
      )}

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
                  backgroundColor: ettlevColors.white,
                  height: 'auto',
                }
              },
            },
            Close: {
              style: {
                display: 'none'
              }
            },
          }}
        >
          <Block display="flex" flexDirection="column" height="100%">
            <Block width="100%" display="flex" justifyContent="flex-end">
              <Button kind="secondary" size="compact" onClick={() => setShowMenu(false)} icon={faTimes}>
                Meny
              </Button>
            </Block>

            <Brand />

            <Block display="flex" flexDirection="column">
              <Block $style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: ettlevColors.grey100, paddingTop: '6px', paddingBottom: '6px' }}>
                <MenuItem to="/" text="forsiden" icon={husIcon} setShowMenu={setShowMenu} />
              </Block>
              <Block $style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: ettlevColors.grey100, paddingTop: '6px', paddingBottom: '6px' }}>
                <MenuItem to="/behandlinger" text="Dokumentere etterlevelse" icon={arkPennIcon} setShowMenu={setShowMenu} />
              </Block>
              <Block $style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: ettlevColors.grey100, paddingTop: '6px', paddingBottom: '6px' }}>
                <MenuItem to="/status" text="Status i organisasjonen" icon={grafIcon} setShowMenu={setShowMenu} />
              </Block>
              <Block $style={{
                borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: ettlevColors.grey100,
                borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: ettlevColors.grey100,
                paddingTop: '6px', paddingBottom: '6px'
              }}>
                <MenuItem to="/tema" text="Forstå kravene" icon={paragrafIcon} setShowMenu={setShowMenu} />
              </Block>
            </Block>
            {/* <Block>
              {user.isAdmin() && (
                <>
                  <NavItem to="/admin/audit" text={intl.audit} />
                  <NavItem to="/admin/settings" text={intl.settings} />
                </>
              )}
            </Block> */}

            <Block display="flex" width="100%" marginTop={theme.sizing.scale1000}>
              {!user.isLoggedIn() && <LoginButton location={url} />}

              {user.isLoggedIn() && (
                <>
                  <Block>
                    <Block>
                      <Paragraph2 color={ettlevColors.green800} $style={{ fontWeight: 600 }}>
                        {user.getIdent()}: {user.getName()}
                      </Paragraph2>
                    </Block>
                    <Block>
                      <SignOutButton location={url} />
                    </Block>
                  </Block>
                </>
              )}
            </Block>

            {/* <Block {...drawerFooterProps}>
              <Block width={'100%'}>
                <ExternalLink href={datajegerSlackLink} hideUnderline>
                  <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
                    <img src={SlackLogo} width="60px" alt="slack logo" />
                    <Paragraph4 color={theme.colors.white}>#etterlevelse </Paragraph4>
                  </Block>
                </ExternalLink>
              </Block>
              <Block width={'100%'}>
                <ExternalLink href={documentationLink} hideUnderline openOnSamePage>
                  <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
                    <Paragraph4 color={theme.colors.white}>Dokumentasjon </Paragraph4>
                  </Block>
                </ExternalLink>
              </Block>
            </Block>
            <Block paddingBottom={theme.sizing.scale600} display={'flex'} justifyContent={'center'}>
              <img src={NavLogo} alt="NAV logo" width="50%" />
            </Block> */}
          </Block>
        </Drawer>
      )}
    </React.Fragment>
  )
}

export default BurgerMenu
