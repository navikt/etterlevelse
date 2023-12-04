import { useUser } from '../../../services/User'
import { intl } from '../../../util/intl/intl'
import { Button, ButtonProps, Link, Tooltip } from '@navikt/ds-react'
import { ClockDashedIcon } from '@navikt/aksel-icons'

interface AuditButtonProps extends ButtonProps {
  id: string
  fontColor?: string
  auditId?: string
  marginLeft?: boolean
  marginRight?: boolean
}

export const AuditButton = (props: AuditButtonProps) => {
  const user = useUser
  const { id, auditId, marginLeft, marginRight, ...restProps } = props
  return user.isAdmin() ? (
    <Link className={`${marginLeft ? 'ml-2' : ''} ${marginRight ? 'mr-2' : ''}`} href={`/admin/audit/${props.id}` + (props.auditId ? `/${props.auditId}` : '')}>
      {props.children ? (
        props.children
      ) : (
        <>
          <Tooltip content={intl.version}>
            <Button {...restProps} icon={<ClockDashedIcon title="Versjonering" />} />
          </Tooltip>
        </>
      )}
    </Link>
  ) : null
}
