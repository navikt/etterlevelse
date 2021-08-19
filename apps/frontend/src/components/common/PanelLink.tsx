import React, { useState } from 'react'
import RouteLink from './RouteLink'
import { Block, BlockOverrides, Responsive, Scale } from 'baseui/block'
import { borderColor, borderRadius, borderStyle, borderWidth, padding, paddingAll } from './Style'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { HeadingXLarge, LabelLarge, LabelSmall, ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import { arrowRightIcon, navChevronRightIcon } from '../Images'
import * as _ from 'lodash'

export const PanelLink = ({
  href,
  title,
  rightTitle,
  beskrivelse,
  rightBeskrivelse,
  panelIcon,
  flip,
  square,
  hideBorderBottom,
  useUnderline
}: {
  href: string
  title: string
  rightTitle?: string
  beskrivelse?: string
  rightBeskrivelse?: string
  flip?: boolean
  square?: boolean
  hideBorderBottom?: boolean
  useUnderline?: boolean
  panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
}) => {
  const [hover, setHover] = useState(false)

  return (
    <RouteLink
      href={href}
      hideUnderline
      $style={{
        display: 'flex',
      }}
    >
      <Block
        overrides={{
          Block: {
            style: {
              width: '100%',
              ...paddingAll(theme.sizing.scale600),
              paddingLeft: theme.sizing.scale300,
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: ettlevColors.white,
              ...borderWidth('1px'),
              ...borderColor(ettlevColors.grey100),
              ...borderStyle('solid'),
              borderBottomStyle: hideBorderBottom ? 'hidden' : 'solid',
              ...(square ? {} : borderRadius('4px')),

              ':hover': {
                position: 'relative',
                boxSizing: 'border-box',
                boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)',
                textDecoration: useUnderline ? 'underline' : 'none'
              },
            },
          },
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Block display="flex" marginLeft="27px" alignItems="center">
          {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}
        </Block>

        <Block
          marginLeft={theme.sizing.scale600}
          marginRight={theme.sizing.scale600}
          $style={{ flexGrow: 1 }}
          display={'flex'}
          flexDirection={flip ? 'column-reverse' : 'column'}
          justifyContent={'center'}
        >
          <LabelLarge $style={{ lineHeight: '20px' }}>{title}</LabelLarge>
          <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>
            {beskrivelse}
          </ParagraphSmall>
        </Block>

        {(rightTitle || rightBeskrivelse) && (
          <Block minWidth={'150px'} maxWidth={'150px'} display={'flex'} flexDirection={flip ? 'column-reverse' : 'column'} justifyContent={'center'}>
            {rightTitle && <LabelSmall>{rightTitle}</LabelSmall>}
            {rightBeskrivelse && (
              <ParagraphSmall marginBottom={0} marginTop={rightTitle ? theme.sizing.scale100 : 0}>
                {rightBeskrivelse}
              </ParagraphSmall>
            )}
          </Block>
        )}

        <Chevron hover={hover} icon={navChevronRightIcon} distance={'4px'} />
      </Block>
    </RouteLink>
  )
}

export type PanelLinkCardOverrides = { Root?: BlockOverrides; Header?: BlockOverrides; Content?: BlockOverrides }

export const PanelLinkCard = ({
  href,
  tittel,
  beskrivelse,
  headerContent,
  footerContent,
  children,
  icon,
  requireLogin,
  height,
  maxHeight,
  width,
  maxWidth,
  verticalMargin,
  overrides,
  flexContent,
  hideArrow,
  marginRight,
}: {
  href?: string
  tittel: string
  beskrivelse?: string
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  children?: React.ReactNode
  icon?: string
  requireLogin?: boolean
  height?: Responsive<Scale>
  maxHeight?: string
  width?: Responsive<Scale>
  maxWidth?: string
  verticalMargin?: string
  overrides?: PanelLinkCardOverrides
  flexContent?: boolean
  hideArrow?: boolean
  marginRight?: Responsive<Scale>
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
        ...borderStyle('solid'),
        ...borderRadius('4px'),

        ':hover': {
          boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.24)',
        },

        ':focus-within': {
          outline: `3px solid ${ettlevColors.focusOutline}`,
          outlineOffset: '1px',
        },
      },
    },
  }
  const rootOverrides = _.merge(rootBaseOverrides, overrides?.Root)

  const paddingSize = theme.sizing.scale600
  const headerOverrides = _.merge(
    {
      Block: {
        style: {
          ...paddingAll(paddingSize),
          paddingBottom: 0,
        },
      },
    },
    overrides?.Header,
  )

  const contentOverrides = _.merge(
    {
      Block: {
        style: {
          ...padding('0', paddingSize),
        },
      },
    },
    overrides?.Content,
  )

  return (
    <Block width={width} maxWidth={maxWidth} overrides={rootOverrides} marginRight={marginRight}>
      <RouteLink href={href} hideUnderline requireLogin={requireLogin}>
        <Block
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          $style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Block overrides={headerOverrides} display={['flex', 'flex', 'flex', 'flex', 'block', 'block']} marginBottom={theme.sizing.scale400}>
            {icon && (
              <Block display={'flex'} justifyContent={'center'} marginTop={theme.sizing.scale600} marginRight={theme.sizing.scale800}>
                <img src={icon} alt={'ikon'} aria-hidden />
              </Block>
            )}

            <Block display="flex" alignItems="flex-end" height={headerContent ? '60%' : ''}>
              <HeadingXLarge
                marginBottom={['0px', '0px', '0px', '0px', theme.sizing.scale700, theme.sizing.scale700]}
                $style={{ textDecoration: href && hover ? '3px underline ' : undefined }}
              >
                {tittel}
              </HeadingXLarge>
            </Block>
            {headerContent && headerContent}
          </Block>

          <Block
            $style={{
              display: 'flex',
              flexDirection: flexContent ? 'row' : 'column',
            }}
          >
            <Block height={height} maxHeight={maxHeight} overrides={contentOverrides} width={flexContent ? '100%' : undefined}>
              {beskrivelse && (
                <Block>
                  <ParagraphMedium marginTop={0}>{beskrivelse}</ParagraphMedium>
                </Block>
              )}

              {children}
            </Block>

            {!hideArrow && (
              <Block placeSelf={'flex-end'} padding={paddingSize} paddingLeft={flexContent ? '0px' : undefined}>
                <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'} />
              </Block>
            )}
          </Block>
        </Block>
      </RouteLink>
    </Block>
  )
}

const Chevron = ({ hover, icon, distance }: { hover: boolean; icon: string; distance: string }) => (
  <Block marginLeft={hover ? `calc(${theme.sizing.scale600} + ${distance})` : theme.sizing.scale600} alignSelf={'center'} marginRight={hover ? '-' + distance : 0}>
    <img src={icon} aria-hidden alt={'Chevron høyre ikon'} width={'24px'} height={'24px'} />
  </Block>
)
