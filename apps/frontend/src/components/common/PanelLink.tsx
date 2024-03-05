import { Block, BlockOverrides, Responsive, Scale } from 'baseui/block'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import * as _ from 'lodash'
import React, { useState } from 'react'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { arrowRightIcon } from '../Images'
import RouteLink from './RouteLink'
import { borderColor, borderRadius, borderStyle, padding, paddingAll } from './Style'

export type TPanelLinkCardOverrides = {
  Root?: BlockOverrides
  Header?: BlockOverrides
  Content?: BlockOverrides
}

export const PanelLinkCard = ({
  href,
  onClick,
  tittel,
  titleColor,
  beskrivelse,
  headerContent,
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
  ComplimentaryContent,
  openinnewtab,
}: {
  href?: string
  onClick?: () => void
  tittel: string
  titleColor?: string
  beskrivelse?: string
  headerContent?: React.ReactNode
  children?: React.ReactNode
  icon?: string
  requireLogin?: boolean
  height?: Responsive<Scale>
  maxHeight?: string
  width?: Responsive<Scale>
  maxWidth?: string
  verticalMargin?: string
  overrides?: TPanelLinkCardOverrides
  flexContent?: boolean
  hideArrow?: boolean
  marginRight?: Responsive<Scale>
  ComplimentaryContent?: React.ReactNode
  openinnewtab?: boolean
}) => {
  const [hover, setHover] = useState(false)

  const rootBaseOverrides: BlockOverrides = {
    Block: {
      style: {
        marginTop: verticalMargin,
        marginBottom: verticalMargin,

        backgroundColor: ettlevColors.white,

        borderWidth: '1px',
        ...borderColor(ettlevColors.grey100),
        ...borderStyle('solid'),
        ...borderRadius('4px'),

        ':hover': {
          boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.24)',
        },

        ':focus-within': {
          outlineColor: ettlevColors.focusOutline,
          outlineWidth: '3px',
          outlineStyle: 'solid',
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
    overrides?.Header
  )

  const contentOverrides = _.merge(
    {
      Block: {
        style: {
          ...padding('0', paddingSize),
        },
      },
    },
    overrides?.Content
  )

  return (
    <Block
      onClick={() => onClick && onClick()}
      width={width}
      maxWidth={maxWidth}
      overrides={rootOverrides}
      marginRight={marginRight}
      height="inherit"
    >
      <RouteLink
        href={href}
        hideUnderline
        requireLogin={requireLogin}
        openinnewtab={(!!openinnewtab).toString()}
      >
        <Block
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          $style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
          }}
          height="100%"
        >
          <Block overrides={headerOverrides} display="block" marginBottom={theme.sizing.scale600}>
            {icon && (
              <Block
                display={'flex'}
                justifyContent={'center'}
                marginTop={theme.sizing.scale600}
                marginRight={theme.sizing.scale850}
              >
                <img src={icon} alt={''} aria-hidden />
              </Block>
            )}

            <Block
              display="flex"
              alignItems="flex-end"
              height={headerContent ? '60%' : ''}
              marginRight={'auto'}
            >
              <HeadingXLarge
                marginBottom={theme.sizing.scale700}
                $style={{
                  textDecoration: href && hover ? '3px underline ' : undefined,
                  color: titleColor ? titleColor : undefined,
                }}
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
              height: height ? '100%' : undefined,
            }}
          >
            <Block
              height={height}
              maxHeight={maxHeight}
              overrides={contentOverrides}
              width={flexContent ? '100%' : undefined}
            >
              {beskrivelse && (
                <Block>
                  <ParagraphMedium marginTop={0}>{beskrivelse}</ParagraphMedium>
                </Block>
              )}

              {children}
            </Block>
          </Block>

          {(ComplimentaryContent || !hideArrow) && (
            <Block display="flex" width="100%" height="100%">
              {ComplimentaryContent && <Block minWidth="70%">{ComplimentaryContent}</Block>}
              {!hideArrow && (
                <Block
                  width="100%"
                  justifyContent="flex-end"
                  alignSelf="flex-end"
                  display="flex"
                  padding={paddingSize}
                  paddingLeft={flexContent ? '0px' : undefined}
                >
                  <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'} />
                </Block>
              )}
            </Block>
          )}
        </Block>
      </RouteLink>
    </Block>
  )
}

export const Chevron = ({
  hover,
  icon,
  distance,
  size,
  marginLeft,
}: {
  hover: boolean
  icon: string
  distance: string
  size?: string
  marginLeft?: string
}) => (
  <Block
    marginLeft={
      hover
        ? `calc(${theme.sizing.scale600} + ${distance})`
        : marginLeft
          ? marginLeft
          : theme.sizing.scale600
    }
    alignSelf={'center'}
    marginRight={hover ? '-' + distance : 0}
  >
    <img
      src={icon}
      aria-hidden
      alt={'Chevron høyre ikon'}
      width={size ? size : '24px'}
      height={size ? size : '24px'}
    />
  </Block>
)
