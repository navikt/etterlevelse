import { Block } from 'baseui/block'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { faInfoCircle, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction } from './AuditTypes'
import { Label } from '@navikt/ds-react'


export const AuditLabel = (props: { label: string; children: any }) => {
  return (
    <div className="flex">
      <div className="flex w-1/5 self-center">
        <Label>{props.label}</Label>
      </div>
      {props.children}
    </div>
  )
}

export const AuditActionIcon = (props: { action: AuditAction; withText?: boolean }) => {
  const icon = (props.action === AuditAction.CREATE && { icon: faPlusCircle, color: theme.colors.positive300 }) ||
    (props.action === AuditAction.UPDATE && { icon: faInfoCircle, color: theme.colors.warning300 }) ||
    (props.action === AuditAction.DELETE && { icon: faMinusCircle, color: theme.colors.negative400 }) || { icon: undefined, color: undefined }

  return (
    <StatefulTooltip content={() => intl[props.action]} placement={PLACEMENT.top}>
      <Block marginRight=".5rem" display="inline">
        <FontAwesomeIcon icon={icon.icon!} color={icon.color} /> {props.withText && intl[props.action]}
      </Block>
    </StatefulTooltip>
  )
}
