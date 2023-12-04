import * as React from 'react'
import Button from '../../common/Button'
import { ANCHOR, Drawer } from 'baseui/drawer'
import { theme } from '../../../util'
import { Block } from 'baseui/block'
import { StyledLink } from 'baseui/link'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import RouteLink from '../../common/RouteLink'
import { useLocation } from 'react-router-dom'
import { env } from '../../../util/env'
import { useStyletron } from 'styletron-react'
import { useUser } from '../../../services/User'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { ettlevColors } from '../../../util/theme'
import { arkPennIcon, exitIcon, grafIcon, husIcon, paragrafIcon } from '../../Images'

const Brand = () => (
  <StyledLink style={{ textDecoration: 'none' }} href="/">
    <HeadingXLarge color={ettlevColors.green800}>Støtte til etterlevelse</HeadingXLarge>
  </StyledLink>
)

const MenuItem = (props: { to: string; text: string; icon: string; setShowMenu: Function }) => (
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
      <Button kind="secondary" startEnhancer={<img src={exitIcon} alt="exit icon" />}>
        Logg ut
      </Button>
    </StyledLink>
  )
}

const BurgerMenu = () => {
  const user = useUser
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
                  height: '100vh',
                }
              },
            },
            Close: {
              style: {
                display: 'none',
              },
            },
          }}
        >
          <Block display="flex" flexDirection="column" height="100%">
            <Block width="100%" display="flex" justifyContent="flex-end" marginBottom={theme.sizing.scale1600}>
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
              <Block
                $style={{
                  borderTopWidth: '1px',
                  borderTopStyle: 'solid',
                  borderTopColor: ettlevColors.grey100,
                  borderBottomWidth: '1px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: ettlevColors.grey100,
                  paddingTop: '6px',
                  paddingBottom: '6px',
                }}
              >
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

            <Block display="flex" flexDirection="column" width="100%" height="100%" marginBottom={theme.sizing.scale1600} justifyContent="flex-end">
              {!user.isLoggedIn() && <LoginButton location={url} />}

              {user.isLoggedIn() && (
                <>
                  <Block>
                    <Block>
                      <ParagraphMedium color={ettlevColors.green800} $style={{ fontWeight: 600 }}>
                        {user.getIdent()}: {user.getName()}
                      </ParagraphMedium>
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
                    <ParagraphXSmall color={theme.colors.white}>#etterlevelse </ParagraphXSmall>
                  </Block>
                </ExternalLink>
              </Block>
              <Block width={'100%'}>
                <ExternalLink href={documentationLink} hideUnderline openOnSamePage>
                  <Block display="flex" justifyContent="center" paddingBottom={theme.sizing.scale400} alignItems="center">
                    <ParagraphXSmall color={theme.colors.white}>Dokumentasjon </ParagraphXSmall>
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
