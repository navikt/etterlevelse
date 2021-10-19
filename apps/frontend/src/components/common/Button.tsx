import * as React from 'react'
import {ReactNode} from 'react'
import {Button as BaseUIButton, KIND, SHAPE, SIZE} from 'baseui/button'
import {PLACEMENT, StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {IconDefinition} from '@fortawesome/fontawesome-svg-core'
import {theme} from '../../util'
import {Override} from 'baseui/overrides'
import {StyleObject} from 'styletron-react'
import {Block} from 'baseui/block'
import {borderRadius, borderStyle, borderWidth, paddingAll} from './Style'
import {ettlevColors} from '../../util/theme'
import {ExternalLink} from './RouteLink'
import _ from 'lodash'

export type ButtonKind = KIND[keyof KIND] | 'outline' | 'underline-hover'

interface ButtonProps {
  kind?: ButtonKind
  type?: 'submit' | 'reset' | 'button'
  size?: SIZE[keyof SIZE]
  shape?: SHAPE[keyof SHAPE]
  icon?: IconDefinition
  iconEnd?: IconDefinition
  inline?: boolean
  tooltip?: string
  children?: ReactNode
  onClick?: () => void
  startEnhancer?: ReactNode
  disabled?: boolean
  $style?: StyleObject
  marginRight?: boolean
  marginLeft?: boolean
  label?: string
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
const outlineOverride: StyleObject = {
  borderColor: ettlevColors.green600,
  backgroundColor: 'inherit',
  ...borderWidth(outlineWidth),
  ...borderStyle(outlineStyle),
}

// underline-hover button is a tertiary with underline as hover effect
const underlineOverride: StyleObject = {
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

const Button = (props: ButtonProps) => {
  const baseuiKind = props.kind === 'outline' ? KIND.secondary : props.kind === 'underline-hover' ? KIND.tertiary : props.kind

  const boxShadow =
    !props.kind || props.kind === 'primary' || props.kind === 'secondary'
      ? {
          style: {
            boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
            ':hover': { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)' },
            ':active': { boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)' },
            ':focus': {
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
              outline: `3px solid ${ettlevColors.focusOutline}`,
            },
          },
        }
      : {}

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
        <BaseUIButton
          kind={baseuiKind}
          size={props.size}
          shape={props.shape}
          onClick={() => props.onClick?.()}
          overrides={{ BaseButton: overrides }}
          startEnhancer={props.startEnhancer}
          disabled={props.disabled}
          type={props.type}
          aria-label={props.label}
        >
          {props.icon && <FontAwesomeIcon icon={props.icon} style={{ marginRight: props.children ? '.5rem' : undefined }} fixedWidth />}
          {props.notBold ? props.children : <strong>{props.children}</strong>}
          {props.iconEnd && <FontAwesomeIcon icon={props.iconEnd} style={{ marginLeft: props.children ? '.5rem' : undefined }} fixedWidth />}
        </BaseUIButton>
      </Tooltip>
      <Block display="inline" marginRight={props.marginRight ? theme.sizing.scale600 : 0} />
    </>
  )
}

export default Button

// Må gjøres properly, laget denne for å unngå tusenvis av react warnings
export const buttonBorderStyle: StyleObject = {
  borderColor: ettlevColors.green600,
  ...borderStyle('solid'),
  ...borderWidth('2px'),
  ...borderRadius('4px'),
}

export const ExternalButton = ({ href, children, underlineHover, size, openOnSamePage }:
                               { href: string; children: React.ReactNode; underlineHover?: boolean; size?: SIZE[keyof SIZE], openOnSamePage?: boolean }) => {
  const kind = underlineHover ? 'underline-hover' : 'outline'
  const actualSize = size || 'compact'
  return (
    <ExternalLink href={href} hideUnderline openOnSamePage={openOnSamePage}>
      <Button kind={kind} size={actualSize}>
        {children}
      </Button>
    </ExternalLink>
  )
}
