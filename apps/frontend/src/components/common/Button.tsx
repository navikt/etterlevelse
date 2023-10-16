import { ExternalLink } from './RouteLink'
import { Button as AkselButton, ButtonProps, Tooltip as AkselTooltip, TooltipProps, OverridableComponent, Link } from '@navikt/ds-react'

interface CustomButtonProps extends ButtonProps {
  type?: 'submit' | 'reset' | 'button'
  tooltip?: string
  marginRight?: boolean
  marginLeft?: boolean
  notBold?: boolean
  onClick?: () => void
}

const Tooltip = (props: TooltipProps) =>
  props.content !== '' ? (
    <AkselTooltip content={props.content} placement="top">
      {props.children}
    </AkselTooltip>
  ) : (
    props.children
  )

const Button: OverridableComponent<CustomButtonProps, HTMLButtonElement> = (props: CustomButtonProps) => {
  const { type, tooltip, marginRight, marginLeft, notBold, onClick, ...restProps } = props
  return (
    <div className={`inline ${props.marginLeft ? 'ml-2.5' : ''} ${props.marginRight ? 'ml-4' : ''}`}>
      <Tooltip content={props.tooltip || ''}>
        <AkselButton type={type} onClick={() => onClick?.()} {...restProps}>
          {props.notBold ? props.children : <strong>{props.children}</strong>}
        </AkselButton>
      </Tooltip>
    </div>
  )
}

export default Button

interface CustomExternalLinkButtonProps extends CustomButtonProps {
  href: string
  underlineHover?: boolean
  openOnSamePage?: boolean
}

export const ExternalButton = (props: CustomExternalLinkButtonProps) => {
  const { href, underlineHover, openOnSamePage, ...restProps } = props
  return (
    <ExternalLink href={href} openOnSamePage={openOnSamePage}>
      <Button as="a" variant={underlineHover ? 'tertiary' : 'secondary'} {...restProps}>
        {props.children}
      </Button>
    </ExternalLink>
  )
}
