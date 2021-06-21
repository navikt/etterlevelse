import { Block } from 'baseui/block'
import { ettlevColors, maxPageWidth, pageWidth, theme } from '../../util/theme'
import RouteLink from '../common/RouteLink'
import Button from '../common/Button'
import { chevronLeft, navChevronRightIcon } from '../Images'
import React from 'react'

const padding = ['16px', '16px', '16px', '20px', '40px', '80px']

export const Page = ({ backUrl, headerOverlap, headerBackgroundColor, backgroundColor, wideMain, rawMain, children, header }: {
  backUrl?: string,
  headerOverlap?: string,
  headerBackgroundColor: string
  backgroundColor: string
  wideMain?: boolean
  rawMain?: boolean
  header?: React.ReactNode,
  children: React.ReactNode,
}) => {
  return (
    <Block width='100%' overrides={{ Block: { props: { role: 'main' } } }} backgroundColor={backgroundColor} paddingBottom={'200px'}>

      <Block backgroundColor={headerBackgroundColor} display='flex' width='100%' justifyContent='center'
        paddingBottom={headerOverlap} marginBottom={headerOverlap ? '-' + headerOverlap : undefined}
      >
        <Block maxWidth={maxPageWidth} width='100%'>

          <Block paddingLeft={padding} paddingRight={padding} paddingTop={theme.sizing.scale800}>
            {backUrl && <RouteLink href={backUrl} hideUnderline>
              <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{ transform: 'rotate(180deg)' }} />} size='compact' kind='underline-hover'
              > Tilbake</Button>
            </RouteLink>}

            {header && <Block width={'100%'} display={'flex'} justifyContent='center'>
              <Block maxWidth={pageWidth} width={'100%'} display={'flex'} flexDirection={'column'} marginBottom={theme.sizing.scale600}>
                {header}
              </Block>
            </Block>}
          </Block>
        </Block>
      </Block>

      <Block display='flex' width='100%' justifyContent='center' marginTop={headerOverlap ? 0 : theme.sizing.scale800}>
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

const ChevronLeft = (props: { fill?: string }) => (
  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 9L8.57143 0L10 1.5L2.85714 9L10 16.5L8.57143 18L0 9Z" fill={ props.fill ? props.fill : ettlevColors.black} />
  </svg>
)


export const Layout2 = (props: {
  backBtnColor?: string,
  backBtnUrl: string,
  headerBackgroundColor: string,
  mainHeader: React.ReactNode,
  secondaryHeaderBackgroundColor: string,
  secondaryHeader: React.ReactNode,
  childrenBackgroundColor: string,
  children: React.ReactNode,
}) => (
  <Block width='100%' overrides={{ Block: { props: { role: 'main' } } }}>
    <Block backgroundColor={props.headerBackgroundColor} display='flex' width='100%' justifyContent='center'>
      <Block maxWidth={maxPageWidth} width='100%'>
        <Block paddingLeft='40px' paddingRight='40px' display='flex' flexDirection='column' justifyContent='center'>
          <Block width='100%' justifyContent='center' marginTop='24px'>
            <Block flex='1' display='flex' justifyContent='flex-start'>
              <RouteLink href={props.backBtnUrl} hideUnderline>
                <Button startEnhancer={<ChevronLeft fill={props.backBtnColor}/>} size='compact' kind='tertiary'
                  $style={{
                    color: !props.backBtnColor ? ettlevColors.black : props.backBtnColor,
                    ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' }
                  }}
                >
                  Tilbake
                </Button>
              </RouteLink>
            </Block>
            {props.mainHeader}
          </Block>
        </Block>
      </Block>
    </Block>

    <Block
      backgroundColor={props.secondaryHeaderBackgroundColor}
      display='flex'
      width='100%'
      justifyContent='center'
    >
      <Block maxWidth={maxPageWidth} width='100%'>
        <Block paddingLeft='40px' paddingRight='40px'>
          {props.secondaryHeader}
        </Block>
      </Block>
    </Block>

    <Block
      backgroundColor={props.childrenBackgroundColor}
      display='flex'
      width='100%'
      justifyContent='center'
    >
      <Block maxWidth={maxPageWidth} width='100%'>
        <Block paddingLeft='40px' paddingRight='40px'>
          {props.children}
        </Block>
      </Block>
    </Block>
  </Block>
)