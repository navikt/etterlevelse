import * as React from 'react'
import { ReactNode } from 'react'
import { KIND, SHAPE, SIZE } from 'baseui/button'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { theme } from '../../util'
import { Override } from 'baseui/overrides'
import { StyleObject } from 'styletron-react'
import { Block } from 'baseui/block'
import { borderColor, borderRadius, borderStyle, borderWidth, padding, paddingAll } from './Style'
import { ettlevColors } from '../../util/theme'
import { ExternalLink } from './RouteLink'
import {Button as AkselButton, ButtonProps} from '@navikt/ds-react'
import _ from 'lodash'

export type ButtonKind = (typeof KIND)[keyof typeof KIND] | 'outline' | 'underline-hover'

interface CustomButtonProps extends ButtonProps {

  kind?:
    | 'primary'
    | 'primary-neutral'
    | 'secondary'
    | 'secondary-neutral'
    | 'tertiary'
    | 'tertiary-neutral'
    | 'danger'
    | 'underline-hover'
    | 'outline'
  type?: 'submit' | 'reset' | 'button'
  inline?: boolean
  tooltip?: string
  children?: ReactNode
  onClick?: () => void
  disabled?: boolean
  $style?: StyleObject
  marginRight?: boolean
  marginLeft?: boolean
  hidePadding?: boolean
  notBold?: boolean
}

interface TooltipProps {
  tooltip?: string
  children: React.ReactElement
}

const Tooltip = (props: TooltipProps) =>
  props.tooltip ? (
    <StatefulTooltip content={props.tooltip} placement={PLACEMENT.top} focusLock={false}>
      {props.children}
    </StatefulTooltip>
  ) : (
    props.children
  )

// outline button is a secondary button, but with a border
const outlineWidth = '2px'
const outlineStyle = 'solid'
const outlineOverride = {
  ...borderColor(ettlevColors.green600),
  backgroundColor: 'inherit',
  ...borderWidth(outlineWidth),
  ...borderStyle(outlineStyle),
}

// underline-hover button is a tertiary with underline as hover effect
const underlineOverride = {
  ...paddingAll('0'),
  textDecorationThickness: '3px',
  ':hover': {
    textDecorationLine: 'underline',
    backgroundColor: 'inherit',
  },
  ':focus': {
    textDecorationLine: 'underline',
    backgroundColor: 'inherit',
  },
}

export const buttonContentStyle = {
  fontSize: '18px',
  ...padding('10px', '12px'),
}

export const primaryFocusBorder = {
  ':focus': {
    outlineStyle: 'solid',
    outlineWidth: '2px',
  },
}

const Button = (props: CustomButtonProps) => {
  const defaultVariant = props.kind === 'outline' ? 'secondary' : props.kind === 'underline-hover' ? 'tertiary' : props.kind

  const boxShadow =
    !props.kind || props.kind === 'primary' || props.kind === 'secondary'
      ? {
          style: {
            ...buttonContentStyle,
            boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
            ':hover': { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)' },
            ':active': { boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)' },
            ':focus': {
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
              outlineWidth: '3px',
              outlineStyle: 'solid',
              outlineColor: ettlevColors.focusOutline,
              outlineOffset: props.kind === 'primary' ? '2px' : undefined,
            },
          },
        }
      : {
          style: {
            buttonContentStyle,
          },
        }

  let overrides: Override<any> = boxShadow
  overrides.style = _.merge(overrides.style, props.kind === 'outline' ? outlineOverride : {})
  overrides.style = _.merge(overrides.style, props.kind === 'underline-hover' ? underlineOverride : {})
  overrides.style = _.merge(overrides.style, props.kind === 'secondary' ? buttonBorderStyle : {})
  overrides.style = _.merge(overrides.style, props.hidePadding ? paddingAll('0') : {})
  overrides.style = _.merge(overrides.style, props.inline ? { paddingTop: theme.sizing.scale100, paddingBottom: theme.sizing.scale100 } : {})
  overrides.style = _.merge(overrides.style, props.$style || {})

  return (
    <>
      <Block display="inline" marginLeft={props.marginLeft ? theme.sizing.scale400 : 0} />
      <Tooltip tooltip={props.tooltip}>
        <AkselButton
          variant={defaultVariant}
          size={props.size}
          onClick={() => props.onClick?.()}
          disabled={props.disabled}
          icon={props.icon}
          iconPosition={props.iconPosition}
          type={props.type}
        >
          {props.notBold ? props.children : <strong>{props.children}</strong>}
        </AkselButton>
      </Tooltip>
      <Block display="inline" marginRight={props.marginRight ? theme.sizing.scale600 : 0} />
    </>
  )
}

export default Button

// Må gjøres properly, laget denne for å unngå tusenvis av react warnings
export const buttonBorderStyle = {
  ...borderColor(ettlevColors.green600),
  ...borderStyle('solid'),
  ...borderWidth('2px'),
  ...borderRadius('4px'),
}

export const ExternalButton = ({
  href,
  children,
  underlineHover,
  size,
  openOnSamePage,
  kind,
}: {
  href: string
  children: React.ReactNode
  underlineHover?: boolean
  size?: (typeof SIZE)[keyof typeof SIZE]
  openOnSamePage?: boolean
  kind?: ButtonKind
}) => {
  const underlineStyle = underlineHover ? 'underline-hover' : 'outline'
  const actualSize = size || 'compact'
  return (
    <ExternalLink href={href} openOnSamePage={openOnSamePage}>
      <Button kind={kind ? kind : underlineStyle} size={actualSize}>
        {children}
      </Button>
    </ExternalLink>
  )
}
