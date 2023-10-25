import { Block } from 'baseui/block'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { faInfoCircle, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction } from './AuditTypes'
import { Label, Tooltip } from '@navikt/ds-react'
import { InformationSquareIcon, MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons'


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
  const icon = (props.action === AuditAction.CREATE && <PlusCircleIcon color="#007C2E" />) ||
    (props.action === AuditAction.UPDATE && <InformationSquareIcon color="#C77300" />) ||
    (props.action === AuditAction.DELETE && <MinusCircleIcon color="#C30000" />) || <div />

  return (
    <Tooltip content={intl[props.action]} placement="top">
      <div className="mr-2 flex justify-center items-center">
        {icon} {props.withText && intl[props.action]}
      </div>
    </Tooltip>
  )
}
