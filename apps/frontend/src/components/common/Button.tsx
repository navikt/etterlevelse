import * as React from 'react'
import { ReactNode } from 'react'
import { Button as BaseUIButton, KIND, SHAPE, SIZE } from 'baseui/button'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { theme } from '../../util'
import { Override } from 'baseui/overrides'
import { StyleObject } from 'styletron-react'
import { Block } from 'baseui/block'


interface ButtonProps {
  kind?: KIND[keyof KIND] | 'outline'
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

const outlineWidth = '2px'
const outlineStyle = 'solid'
const outlineOverride: Override<any> = {
  style: {
    borderColor: theme.colors.buttonPrimaryFill,
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
}

const Button = (props: ButtonProps) => {
  const baseuiKind = props.kind === 'outline' ? KIND.secondary : props.kind
  const overrides: Override<any> = {
    style: {
      ...(props.kind === 'outline' ? outlineOverride.style : {}),
      ...(props.inline ? {paddingTop: theme.sizing.scale100, paddingBottom: theme.sizing.scale100} : {}),
      ...(props.$style || {})
    }
  }
  return (
    <>
      <Block display='inline' marginLeft={props.marginLeft ? theme.sizing.scale400 : 0}/>
      <Tooltip tooltip={props.tooltip}>
        <BaseUIButton kind={baseuiKind} size={props.size} shape={props.shape} onClick={() => props.onClick?.()} overrides={{BaseButton: overrides}}
                      startEnhancer={props.startEnhancer} disabled={props.disabled} type={props.type}
        >
          {props.icon && <FontAwesomeIcon icon={props.icon} style={{marginRight: props.children ? '.5rem' : undefined}}/>}
          {props.children}
          {props.iconEnd && <FontAwesomeIcon icon={props.iconEnd} style={{marginLeft: props.children ? '.5rem' : undefined}}/>}
        </BaseUIButton>
      </Tooltip>
      <Block display='inline' marginRight={props.marginRight ? theme.sizing.scale400 : 0}/>
    </>
  )
}

export default Button
