import React, { useState } from 'react'
import RouteLink, { ExternalLink } from './RouteLink'
import { Block, BlockOverrides, Display, Responsive, Scale } from 'baseui/block'
import { borderColor, borderRadius, borderStyle, borderWidth, padding, paddingAll, paddingZero } from './Style'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { HeadingXLarge, LabelLarge, LabelSmall, ParagraphMedium, ParagraphSmall, ParagraphXSmall } from 'baseui/typography'
import { arrowRightIcon, navChevronRightIcon } from '../Images'
import * as _ from 'lodash'
import Button from './Button'

interface PanelProps {
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

interface PanelButtonProps {
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
}: PanelProps) => {
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
}: PanelButtonProps) => {
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
}: PanelProps) => {
  return (
    <ExternalLink href={href} hideUnderline>
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

export type PanelLinkCardOverrides = { Root?: BlockOverrides; Header?: BlockOverrides; Content?: BlockOverrides }

export const PanelLinkCard = ({
  href,
  tittel,
  titleColor,
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
  ComplimentaryContent,
}: {
  href?: string
  tittel: string
  titleColor?: string
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
  ComplimentaryContent?: React.ReactNode
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
    <Block width={width} maxWidth={maxWidth} overrides={rootOverrides} marginRight={marginRight} height="inherit">
      <RouteLink href={href} hideUnderline requireLogin={requireLogin}>
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
          <Block overrides={headerOverrides} display={['flex', 'flex', 'flex', 'flex', 'block', 'block']} marginBottom={theme.sizing.scale400}>
            {icon && (
              <Block display={'flex'} justifyContent={'center'} marginTop={theme.sizing.scale600} marginRight={theme.sizing.scale800}>
                <img src={icon} alt={''} aria-hidden />
              </Block>
            )}

            <Block display="flex" alignItems="flex-end" height={headerContent ? '60%' : ''} marginRight={'auto'}>
              <HeadingXLarge
                marginBottom={['0px', '0px', '0px', '0px', theme.sizing.scale700, theme.sizing.scale700]}
                $style={{ textDecoration: href && hover ? '3px underline ' : undefined, color: titleColor ? titleColor : undefined }}
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
              height: height ? '100%' : undefined
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

            {
              (ComplimentaryContent || !hideArrow) &&
              <Block display="flex" width="100%" height="100%" alignItems="end">
                {ComplimentaryContent &&
                  <Block width="100%">
                    {ComplimentaryContent}
                  </Block>
                }
                {!hideArrow && (
                  <Block width="100%" justifyContent="flex-end" alignSelf="flex-end" display="flex" padding={paddingSize} paddingLeft={flexContent ? '0px' : undefined}>
                    <Chevron hover={hover} icon={arrowRightIcon} distance={'8px'} />
                  </Block>
                )}
              </Block>
            }
          </Block>
        </Block>
      </RouteLink>
    </Block>
  )
}

export const Chevron = ({ hover, icon, distance, size, marginLeft }: { hover: boolean; icon: string; distance: string; size?: string; marginLeft?: string }) => (
  <Block
    marginLeft={hover ? `calc(${theme.sizing.scale600} + ${distance})` : marginLeft ? marginLeft : theme.sizing.scale600}
    alignSelf={'center'}
    marginRight={hover ? '-' + distance : 0}
  >
    <img src={icon} aria-hidden alt={'Chevron høyre ikon'} width={size ? size : '24px'} height={size ? size : '24px'} />
  </Block>
)

export const SimplePanel = ({
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
  const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

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
    <Block display={responsiveDisplay} overrides={mergedOverrides} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {panelIcon && (
        <Block display="flex" marginLeft="27px" alignItems="center">
          {typeof panelIcon === 'function' ? panelIcon(hover) : panelIcon}
        </Block>
      )}

      <Block
        marginLeft={theme.sizing.scale600}
        marginRight={theme.sizing.scale600}
        $style={{ flexGrow: 1 }}
        display={'flex'}
        flexDirection={flip ? 'column-reverse' : 'column'}
        justifyContent={'center'}
        alignItems="flex-start"
      >
        <Block
          $style={{
            textDecoration: useTitleUnderLine && hover ? 'underline' : 'none',
          }}
        >
          {title instanceof String ? <LabelLarge $style={{ lineHeight: '20px' }}>{title}</LabelLarge> : title}
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

      <Block display="flex">
        {statusText && (
          <Block
            minWidth="100px"
            display="flex"
            flexDirection={['row', 'row', 'row', 'row-reverse', 'row-reverse', 'row-reverse']}
            marginRight="20px"
            alignItems="center"
            marginLeft={[theme.sizing.scale600, theme.sizing.scale600, theme.sizing.scale600, '0px', '0px', '0px']}
            marginTop={[theme.sizing.scale600, theme.sizing.scale600, theme.sizing.scale600, '0px', '0px', '0px']}
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
                marginLeft={[theme.sizing.scale600, theme.sizing.scale600, theme.sizing.scale600, '0px', '0px', '0px']}
                marginTop={[theme.sizing.scale600, theme.sizing.scale600, theme.sizing.scale600, '0px', '0px', '0px']}
              >
                {rightTitle && <LabelSmall $style={{ fontSize: '14px' }}>{rightTitle}</LabelSmall>}
                {rightBeskrivelse && (
                  <ParagraphXSmall marginBottom="0px" marginTop="0px" $style={{ lineHeight: '15px' }}>
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
