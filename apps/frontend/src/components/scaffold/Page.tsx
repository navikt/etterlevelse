import { Block } from 'baseui/block'
import React from 'react'
import { Helmet } from 'react-helmet'
import { ettlevColors, maxPageWidth, pageWidth, responsivePaddingSmall, theme } from '../../util/theme'
import CustomizedBreadcrumbs, { IBreadcrumbPaths } from '../common/CustomizedBreadcrumbs'

const padding = ['16px', '16px', '16px', '20px', '40px', '80px']

export const PageLayout = ({
  children,
  pageTitle,
  fullWidth,
  noPadding,
  currentPage,
  breadcrumbPaths,
}: {
  children: React.ReactNode
  pageTitle?: string
  fullWidth?: boolean
  noPadding?: boolean
  currentPage?: string
  breadcrumbPaths?: IBreadcrumbPaths[]
}) => {

  return (
    <div id="content" role="main" className={`flex flex-col w-full bg-white ${fullWidth ? '' : 'max-w-7xl'}`}>
      <div className={`${noPadding ? '' : 'px-2 pb-6'}`}>
        {(currentPage || breadcrumbPaths) && (
          <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />
        )}
        {pageTitle && (
          <Helmet>
            <meta charSet="utf-8" />
            <title>{pageTitle}</title>
          </Helmet>
        )}

        {children}
      </div>
    </div>
  )
}

export const Page = ({
  hideBackBtn,
  backUrl,
  headerOverlap,
  headerBackgroundColor,
  backgroundColor,
  wideMain,
  rawMain,
  children,
  header,
  backBtnColor,
  currentPage,
  breadcrumbPaths,
}: {
  backBtnColor?: string
  backUrl?: string
  headerOverlap?: string
  headerBackgroundColor: string
  backgroundColor: string
  wideMain?: boolean
  rawMain?: boolean
  header?: React.ReactNode
  children: React.ReactNode
  hideBackBtn?: boolean
  currentPage?: string
  breadcrumbPaths?: IBreadcrumbPaths[]
}) => {
  return (
    <Block id="content" width="100%" overrides={{ Block: { props: { role: 'main' } } }} backgroundColor={backgroundColor} paddingBottom={'200px'}>
      <Block
        backgroundColor={headerBackgroundColor}
        display="flex"
        width="100%"
        justifyContent="center"
        paddingBottom={headerOverlap}
        marginBottom={headerOverlap ? '-' + headerOverlap : undefined}
      >
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={padding} paddingRight={padding} paddingTop={theme.sizing.scale800}>
            {/* {!hideBackBtn && (
              <RouteLink href={backUrl} hideUnderline>
                <Button
                  startEnhancer={<ChevronLeft fill={backBtnColor}/>}
                  size="compact"
                  kind="tertiary"
                  $style={{
                    color: !backBtnColor ? ettlevColors.black : backBtnColor,
                    ':hover': {backgroundColor: 'transparent', textDecoration: 'underline 3px'},
                  }}
                >
                  {' '}
                  Tilbake
                </Button>
              </RouteLink>
            )} */}
            {(currentPage || breadcrumbPaths) && (
              <CustomizedBreadcrumbs fontColor={!backBtnColor ? ettlevColors.black : backBtnColor} currentPage={currentPage} paths={breadcrumbPaths} />
            )}
            {header && (
              <Block width={'100%'} display={'flex'} justifyContent="center">
                <Block maxWidth={pageWidth} width={'100%'} display={'flex'} flexDirection={'column'} marginBottom={theme.sizing.scale600}>
                  {header}
                </Block>
              </Block>
            )}
          </Block>
        </Block>
      </Block>

      <Block display="flex" width="100%" justifyContent="center" marginTop={headerOverlap ? 0 : theme.sizing.scale800}>
        {!wideMain && !rawMain && <Narrow>{children}</Narrow>}
        {wideMain && !rawMain && <Wide>{children}</Wide>}
        {rawMain && children}
      </Block>
    </Block>
  )
}

export const Wide = (props: { children: React.ReactNode }) => (
  <Block maxWidth={maxPageWidth} width={'100%'}>
    <Block paddingLeft={padding} paddingRight={padding}>
      {props.children}
    </Block>
  </Block>
)

export const Narrow = (props: { children: React.ReactNode }) => (
  <Block maxWidth={pageWidth} width={'100%'}>
    {props.children}
  </Block>
)

export const Layout2 = (props: {
  backBtnColor?: string
  backBtnUrl?: string
  headerOverlap?: string
  headerBackgroundColor?: string
  mainHeader?: React.ReactNode
  secondaryHeaderBackgroundColor?: string
  secondaryHeader?: React.ReactNode
  childrenBackgroundColor?: string
  children: React.ReactNode
  currentPage?: string
  breadcrumbPaths?: IBreadcrumbPaths[]
}) => {
  // const history = useHistory()
  // const location = useLocation()
  // console.log(history.location.pathname)
  return (
    <Block width="100%" id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Block backgroundColor={props.headerBackgroundColor} display="flex" width="100%" justifyContent="center" paddingBottom={props.headerOverlap}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} display="flex" flexDirection="column" justifyContent="center">
            <Block width="100%" justifyContent="center" marginTop="24px">
              <Block flex="1" justifyContent="flex-start">
                {/* <RouteLink href={props.backBtnUrl} hideUnderline>
                  <Button
                    startEnhancer={<ChevronLeft fill={props.backBtnColor}/>}
                    size="compact"
                    kind="tertiary"
                    $style={{
                      color: !props.backBtnColor ? ettlevColors.black : props.backBtnColor,
                      ':hover': {backgroundColor: 'transparent', textDecoration: 'underline 3px'},
                    }}
                  >
                    Tilbake
                  </Button>
                </RouteLink> */}
                {(props.currentPage || props.breadcrumbPaths) && (
                  <CustomizedBreadcrumbs fontColor={!props.backBtnColor ? ettlevColors.black : props.backBtnColor} currentPage={props.currentPage} paths={props.breadcrumbPaths} />
                )}
              </Block>
              {props.mainHeader}
            </Block>
          </Block>
        </Block>
      </Block>

      <Block backgroundColor={props.secondaryHeaderBackgroundColor} display="flex" width="100%" justifyContent="center">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall}>
            {props.secondaryHeader}
          </Block>
        </Block>
      </Block>

      <Block backgroundColor={props.childrenBackgroundColor} display="flex" width="100%" justifyContent="center">
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingSmall} paddingRight={responsivePaddingSmall} marginTop={props.headerOverlap ? '-' + props.headerOverlap : undefined}>
            {props.children}
          </Block>
        </Block>
      </Block>
    </Block>
  )
}
