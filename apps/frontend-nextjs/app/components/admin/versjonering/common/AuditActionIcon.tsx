import { EAuditAction } from '@/constants/admin/audit/auditConstants'
import { InformationSquareIcon, MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { Tooltip } from '@navikt/ds-react'

export const AuditActionIcon = (props: { action: EAuditAction; withText?: boolean }) => {
  const icon = (props.action === EAuditAction.CREATE && (
    <PlusCircleIcon aria-label='' aria-hidden color='#007C2E' />
  )) ||
    (props.action === EAuditAction.UPDATE && (
      <InformationSquareIcon aria-label='' aria-hidden color='#C77300' />
    )) ||
    (props.action === EAuditAction.DELETE && (
      <MinusCircleIcon aria-label='' aria-hidden color='#C30000' />
    )) || <div />

  const toolTipContentFromAction = (action: EAuditAction) => {
    switch (action) {
      case EAuditAction.CREATE:
        return 'Opprett'
      case EAuditAction.UPDATE:
        return 'Oppdater'
      case EAuditAction.DELETE:
        return 'Slett'
      default:
        return ''
    }
  }

  return (
    <Tooltip content={toolTipContentFromAction(props.action)} placement='top'>
      <div className='mr-2 flex justify-center items-center'>
        {icon} {props.withText && toolTipContentFromAction(props.action)}
      </div>
    </Tooltip>
  )
}
