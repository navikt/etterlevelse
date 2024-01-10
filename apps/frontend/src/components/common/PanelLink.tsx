import { Block, BlockOverrides, Responsive, Scale } from 'baseui/block'
import {
  HeadingXLarge,
  LabelLarge,
  LabelSmall,
  ParagraphMedium,
  ParagraphSmall,
  ParagraphXSmall,
} from 'baseui/typography'
import * as _ from 'lodash'
import React, { useState } from 'react'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { arrowRightIcon, navChevronRightIcon } from '../Images'
import Button from './Button'
import RouteLink, { ExternalLink } from './RouteLink'
import {
  borderColor,
  borderRadius,
  borderStyle,
  borderWidth,
  padding,
  paddingAll,
  paddingZero,
} from './Style'

interface IPanelProps {
  href: string
  title: string | React.ReactNode
  rightTitle?: string
  beskrivelse?: string | React.ReactNode
  rightBeskrivelse?: string
  flip?: boolean
  square?: boolean
  hideBorderBottom?: boolean
  useUnderline?: boolean
  statusText?: string | React.ReactNode
  panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
  overrides?: BlockOverrides
  useTitleUnderLine?: boolean
  useDescriptionUnderline?: boolean
  hideChevron?: boolean
}

interface IPanelButtonProps {
  onClick: () => void
  title: string | React.ReactNode
  rightTitle?: string
  beskrivelse?: string | React.ReactNode
  rightBeskrivelse?: string
  flip?: boolean
  square?: boolean
  hideBorderBottom?: boolean
  useUnderline?: boolean
  statusText?: string | React.ReactNode
  panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
  overrides?: BlockOverrides
  useTitleUnderLine?: boolean
  useDescriptionUnderline?: boolean
  hideChevron?: boolean
}

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
  useUnderline,
  statusText,
  overrides,
  useTitleUnderLine,
  useDescriptionUnderline,
  hideChevron,
}: IPanelProps) => {
  return (
    <RouteLink
      href={href}
      hideUnderline
      $style={{
        display: 'flex',
      }}
    >
      <SimplePanel
        title={title}
        rightTitle={rightTitle}
        beskrivelse={beskrivelse}
        rightBeskrivelse={rightBeskrivelse}
        panelIcon={panelIcon}
        flip={flip}
        square={square}
        hideBorderBottom={hideBorderBottom}
        useUnderline={useUnderline}
        statusText={statusText}
        overrides={overrides}
        useTitleUnderLine={useTitleUnderLine}
        useDescriptionUnderline={useDescriptionUnderline}
        hideChevron={hideChevron}
      />
    </RouteLink>
  )
}

export const PanelButton = ({
  onClick,
  title,
  rightTitle,
  beskrivelse,
  rightBeskrivelse,
  panelIcon,
  flip,
  square,
  hideBorderBottom,
  useUnderline,
  statusText,
  overrides,
  useTitleUnderLine,
  useDescriptionUnderline,
  hideChevron,
}: IPanelButtonProps) => {
  return (
    <Button
      notBold
      onClick={onClick}
      kind="tertiary"
      $style={{
        ...paddingZero,
        width: '100%',
        boxShadow: 'unset',
        ':hover': { boxShadow: 'unset' },
        ':active': { boxShadow: 'unset' },
        ':focus': { boxShadow: 'unset', outline: 'unset' },
      }}
    >
      <SimplePanel
        button
        title={title}
        rightTitle={rightTitle}
        beskrivelse={beskrivelse}
        rightBeskrivelse={rightBeskrivelse}
        panelIcon={panelIcon}
        flip={flip}
        square={square}
        hideBorderBottom={hideBorderBottom}
        useUnderline={useUnderline}
        statusText={statusText}
        overrides={overrides}
        useTitleUnderLine={useTitleUnderLine}
        useDescriptionUnderline={useDescriptionUnderline}
        hideChevron={hideChevron}
      />
    </Button>
  )
}

export const PanelExternalLink = ({
  href,
  title,
  rightTitle,
  beskrivelse,
  rightBeskrivelse,
  panelIcon,
  flip,
  square,
  hideBorderBottom,
  useUnderline,
  statusText,
  overrides,
  useTitleUnderLine,
  useDescriptionUnderline,
  hideChevron,
}: IPanelProps) => {
  return (
    <ExternalLink href={href}>
      <SimplePanel
        title={title}
        rightTitle={rightTitle}
        beskrivelse={beskrivelse}
        rightBeskrivelse={rightBeskrivelse}
        panelIcon={panelIcon}
        flip={flip}
        square={square}
        hideBorderBottom={hideBorderBottom}
        useUnderline={useUnderline}
        statusText={statusText}
        overrides={overrides}
        useTitleUnderLine={useTitleUnderLine}
        useDescriptionUnderline={useDescriptionUnderline}
        hideChevron={hideChevron}
      />
    </ExternalLink>
  )
}

export type PanelLinkCardOverrides = {
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
  overrides?: PanelLinkCardOverrides
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

export const SimplePanel = ({
  button,
  title,
  rightTitle,
  beskrivelse,
  rightBeskrivelse,
  panelIcon,
  flip,
  statusText,
  useTitleUnderLine,
  overrides,
  useDescriptionUnderline,
  hideChevron,
  square,
  hideBorderBottom,
  useUnderline,
}: {
  button?: boolean
  title: string | React.ReactNode
  rightTitle?: string
  beskrivelse?: string | React.ReactNode
  rightBeskrivelse?: string
  flip?: boolean
  square?: boolean
  hideBorderBottom?: boolean
  useUnderline?: boolean
  statusText?: string | React.ReactNode
  panelIcon?: React.ReactNode | ((hover: boolean) => React.ReactNode)
  overrides?: BlockOverrides
  useTitleUnderLine?: boolean
  useDescriptionUnderline?: boolean
  hideChevron?: boolean
}) => {
  const [hover, setHover] = useState(false)
  const responsiveDisplay: Responsive<any> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

  const customOverrides: BlockOverrides = {
    Block: {
      style: {
        width: '100%',
        ...paddingAll(theme.sizing.scale300),
        paddingRight: theme.sizing.scale600,
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: ettlevColors.white,
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        ...borderStyle('solid'),
        borderBottomStyle: hideBorderBottom ? 'hidden' : 'solid',
        ...(square ? {} : borderRadius('4px')),
        ...borderRadius('4px'),

        ':hover': {
          position: 'relative',
          boxSizing: 'border-box',
          boxShadow: '0px 3px 4px rgba(0, 0, 0, 0.12)',
          textDecoration: useUnderline ? 'underline' : 'none',
        },
      },
    },
  }

  const mergedOverrides = _.merge(customOverrides, overrides)

  return (
    <Block
      display={responsiveDisplay}
      overrides={mergedOverrides}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex gap-2">
        {panelIcon && (
          <Block display="flex" marginLeft="27px" alignItems="center">
            {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}
          </Block>
        )}

        <Block
          marginLeft={theme.sizing.scale600}
          marginRight={theme.sizing.scale600}
          $style={{ flexGrow: 1, textAlign: 'left' }}
          display={'flex'}
          flexDirection={flip ? 'column-reverse' : 'column'}
          justifyContent={'center'}
          alignItems="flex-start"
          maxWidth={button ? '537px' : '547px'}
        >
          <Block
            $style={{
              textDecoration: useTitleUnderLine && hover ? 'underline' : 'none',
            }}
          >
            {title instanceof String ? (
              <LabelLarge $style={{ lineHeight: '20px' }}>{title}</LabelLarge>
            ) : (
              title
            )}
          </Block>
          <Block
            $style={{
              textDecoration: useDescriptionUnderline && hover ? 'underline' : 'none',
            }}
          >
            {beskrivelse instanceof String ? (
              <ParagraphSmall marginBottom={0} marginTop={theme.sizing.scale100}>
                {beskrivelse}
              </ParagraphSmall>
            ) : (
              beskrivelse
            )}
          </Block>
        </Block>
      </div>

      <Block display="flex">
        {statusText && (
          <Block
            minWidth="100px"
            display="flex"
            flexDirection="row-reverse"
            marginRight="20px"
            alignItems="center"
          >
            {statusText instanceof String ? <LabelSmall>{statusText}</LabelSmall> : statusText}
          </Block>
        )}
        <Block display="flex" width="100%">
          {(rightTitle || rightBeskrivelse) && (
            <Block display="flex">
              <Block
                minWidth="175px"
                maxWidth="175px"
                display="flex"
                flexDirection={flip ? 'column-reverse' : 'column'}
                justifyContent="center"
                $style={{ textAlign: 'left' }}
              >
                {rightTitle && <LabelSmall $style={{ fontSize: '14px' }}>{rightTitle}</LabelSmall>}
                {rightBeskrivelse && (
                  <ParagraphXSmall
                    marginBottom="0px"
                    marginTop="0px"
                    $style={{ lineHeight: '15px' }}
                  >
                    {rightBeskrivelse}
                  </ParagraphXSmall>
                )}
              </Block>
            </Block>
          )}
          {!hideChevron && <Chevron hover={hover} icon={navChevronRightIcon} distance={'4px'} />}
        </Block>
      </Block>
    </Block>
  )
}
