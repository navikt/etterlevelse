import { ClockDashedIcon } from '@navikt/aksel-icons'
import { Button, ButtonProps, Link, Tooltip } from '@navikt/ds-react'
import { user } from '../../../services/User'
import { intl } from '../../../util/intl/intl'

interface IAuditButtonProps extends ButtonProps {
  id: string
  fontColor?: string
  auditId?: string
  marginLeft?: boolean
  marginRight?: boolean
}

export const AuditButton = (props: IAuditButtonProps) => {
  const { id, auditId, marginLeft, marginRight, children, ...restProps } = props
  return user.isAdmin() ? (
    <Link
      className={`${marginLeft ? 'ml-2' : ''} ${marginRight ? 'mr-2' : ''}`}
      href={`/admin/audit/${id}` + (auditId ? `/${auditId}` : '')}
    >
      {children ? (
        children
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
