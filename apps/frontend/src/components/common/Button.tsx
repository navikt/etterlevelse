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
import {borderRadius, borderStyle, borderWidth, marginAll} from './Style'
import {ettlevColors} from '../../util/theme'


interface ButtonProps {
  kind?: KIND[keyof KIND] | 'outline' | 'underline-hover'
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
  label?: string,
  hidePadding?: boolean
}

interface TooltipProps {
  tooltip?: string
  children: React.ReactElement
}

const Tooltip = (props: TooltipProps) => (
  props.tooltip ?
    <StatefulTooltip content={props.tooltip} placement={PLACEMENT.top} focusLock={false}>{props.children}</StatefulTooltip>
    : props.children
)

// outline button is a secondary button, but with a border
const outlineWidth = '2px'
const outlineStyle = 'solid'
const outlineOverride: StyleObject = {
  borderColor: ettlevColors.green600,
  backgroundColor: 'inherit',
  borderLeftWidth: outlineWidth,
  borderRightWidth: outlineWidth,
  borderTopWidth: outlineWidth,
  borderBottomWidth: outlineWidth,
  borderLeftStyle: outlineStyle,
  borderRightStyle: outlineStyle,
  borderTopStyle: outlineStyle,
  borderBottomStyle: outlineStyle
}

// underline-hover button is a tertiary with underline as hover effect
const underlineOverride: StyleObject = {
  ':hover': {
    textDecoration: 'underline',
    backgroundColor: 'inherit'
  },
  ':focus': {
    textDecoration: 'underline',
    backgroundColor: 'inherit'
  }
}

const Button = (props: ButtonProps) => {
  const baseuiKind = props.kind === 'outline' ? KIND.secondary : props.kind === 'underline-hover' ? KIND.tertiary : props.kind

  const boxShadow = !props.kind || props.kind === 'primary' || props.kind === 'secondary' ? {
    style: {
      boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
      ':hover': {boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)'},
      ':active': {boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)'},
      ':focus': {boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)'}
    }
  } : {}

  const overrides: Override<any> = {
    style: {
      ...(props.kind === 'outline' ? outlineOverride : {}),
      ...(props.kind === 'underline-hover' ? underlineOverride : {}),
      ...(props.kind === 'secondary' ? buttonBorderStyle: {}),
      ...(props.hidePadding ? marginAll('0') : {}),
      ...(props.inline ? { paddingTop: theme.sizing.scale100, paddingBottom: theme.sizing.scale100 } : {}),
      ...(props.$style || {}),
      ...(boxShadow.style)
    }
  }
  return (
    <>
      <Block display='inline' marginLeft={props.marginLeft ? theme.sizing.scale400 : 0} />
      <Tooltip tooltip={props.tooltip}>
        <BaseUIButton kind={baseuiKind} size={props.size} shape={props.shape} onClick={() => props.onClick?.()} overrides={{ BaseButton: overrides }}
          startEnhancer={props.startEnhancer} disabled={props.disabled} type={props.type}
          aria-label={props.label}
        >
          {props.icon && <FontAwesomeIcon icon={props.icon} style={{ marginRight: props.children ? '.5rem' : undefined }} />}
          <b>{props.children}</b>
          {props.iconEnd && <FontAwesomeIcon icon={props.iconEnd} style={{ marginLeft: props.children ? '.5rem' : undefined }} />}
        </BaseUIButton>
      </Tooltip>
      <Block display='inline' marginRight={props.marginRight ? theme.sizing.scale400 : 0} />
    </>
  )
}

export default Button

// Må gjøres properly, laget denne for å unngå tusenvis av react warnings
export const buttonBorderStyle: StyleObject = {
  borderColor: ettlevColors.green600,
  ...borderStyle('solid'),
  ...borderWidth('2px'),
  ...borderRadius('4px')
}
