import React, {useState} from 'react'
import RouteLink from './RouteLink'
import {Block, BlockOverrides, Responsive, Scale} from 'baseui/block'
import {borderRadius, padding, paddingAll} from './Style'
import {theme} from '../../util'
import {ettlevColors} from '../../util/theme'
import {HeadingXLarge, LabelLarge, LabelSmall, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {arrowRightIcon, navChevronRightIcon} from '../Images'
import * as _ from 'lodash'

export const PanelLink = ({href, title, rightTitle, beskrivelse, rightBeskrivelse, panelIcon, flip}:
                            {
                              href: string, title: string, rightTitle?: string, beskrivelse?: string, rightBeskrivelse?: string,
                              flip?: boolean
                              panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
                            }) => {
  const [hover, setHover] = useState(false)

  return (
    <RouteLink href={href} hideUnderline $style={{
      display: 'flex'
    }}>
      <Block overrides={{
        Block: {
          style: {
            width: '100%',
            ...paddingAll(theme.sizing.scale600),
            paddingLeft: theme.sizing.scale300,
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: ettlevColors.white,

            borderWidth: '1px',
            borderColor: ettlevColors.grey100,
            borderStyle: 'solid',
            ...borderRadius('4px'),

            ':hover': {
              position: 'relative',
              boxSizing: 'border-box',
              boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)'
            }
          }
        }
      }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}

        <Block marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale600} $style={{flexGrow: 1}}
               display={'flex'} flexDirection={flip ? 'column-reverse' : 'column'} justifyContent={'center'}>
          <LabelLarge $style={{lineHeight: '20px'}}>{title}</LabelLarge>
          <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>{beskrivelse}</ParagraphSmall>
        </Block>

        {(rightTitle || rightBeskrivelse) &&
        <Block minWidth={'150px'} maxWidth={'150px'} display={'flex'} flexDirection={flip ? 'column-reverse' : 'column'} justifyContent={'center'}>
          {rightTitle && <LabelSmall>{rightTitle}</LabelSmall>}
          {rightBeskrivelse && <ParagraphSmall marginBottom={0} marginTop={rightTitle ? theme.sizing.scale100 : 0}>{rightBeskrivelse}</ParagraphSmall>}
        </Block>}

        <Chevron hover={hover} icon={navChevronRightIcon} distance={'4px'}/>

      </Block>
    </RouteLink>
  )
}


export type PanelLinkCardOverrides = {Root?: BlockOverrides, Header?: BlockOverrides, Content?: BlockOverrides}

export const PanelLinkCard = (
  {
    href, tittel, beskrivelse,
    children,
    icon, requireLogin,
    height, maxHeight,
    width, maxWidth,
    verticalMargin, overrides
  }: {
    href?: string, tittel: string, beskrivelse?: string,
    children?: React.ReactNode,
    icon?: string, requireLogin?: boolean
    height?: Responsive<Scale>, maxHeight?: string,
    width?: Responsive<Scale>, maxWidth?: string,
    verticalMargin?: string
    overrides?: PanelLinkCardOverrides
  }) => {
  const [hover, setHover] = useState(false)

  const rootBaseOverrides: BlockOverrides = {
    Block: {
      style: {
        marginTop: verticalMargin,
        marginBottom: verticalMargin,

        backgroundColor: ettlevColors.white,

        borderWidth: '1px',
        borderColor: ettlevColors.grey100,
        borderStyle: 'solid',
        ...borderRadius('4px'),

        ':hover': {
          boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.24)'
        },

        ':focus-within': {
          outline: `3px solid ${ettlevColors.focusOutline}`,
          outlineOffset: '1px'
        }
      }
    }
  }
  const rootOverrides = _.merge(rootBaseOverrides, overrides?.Root)

  const paddingSize = theme.sizing.scale600
  const headerOverrides = _.merge({
    Block: {
      style: {
        ...paddingAll(paddingSize),
        paddingBottom: 0
      }
    }
  }, overrides?.Header)

  const contentOverrides = _.merge({
    Block: {
      style: {
        ...padding('0', paddingSize),
      }
    }
  }, overrides?.Content)

  return (
    <Block width={width} maxWidth={maxWidth} overrides={rootOverrides}>
      <RouteLink href={href} hideUnderline requireLogin={requireLogin}>
        <Block onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
               $style={{
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'space-between',
               }}>

          <Block overrides={headerOverrides}>
            {icon && <Block display={'flex'} justifyContent={'center'} width={'100%'} marginTop={theme.sizing.scale600}>
              <img src={icon} alt={'ikon'} aria-hidden width={'30%'}/>
            </Block>}
            <HeadingXLarge $style={{textDecoration: href && hover ? '3px underline ' : undefined}}>{tittel}</HeadingXLarge>
          </Block>

          <Block height={height} maxHeight={maxHeight} overrides={contentOverrides}>
            {beskrivelse && <Block>
              <ParagraphMedium marginTop={0}>{beskrivelse}</ParagraphMedium>
            </Block>}

            {children}
          </Block>

          <Block placeSelf={'flex-end'} padding={paddingSize}>
            <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'}/>
          </Block>

        </Block>
      </RouteLink>
    </Block>
  )
}

const Chevron = ({hover, icon, distance}: {hover: boolean, icon: string, distance: string}) => (
  <Block marginLeft={hover ? `calc(${theme.sizing.scale600} + ${distance})` : theme.sizing.scale600} alignSelf={'center'}
         marginRight={hover ? '-' + distance : 0}>
    <img src={icon} aria-hidden alt={'Chevron høyre ikon'} width={'24px'} height={'24px'}/>
  </Block>
)
