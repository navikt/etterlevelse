import { adminAuditUrl } from '@/routes/admin/audit/auditRoutes'
import { user } from '@/services/user/userService'
import { ClockDashedIcon } from '@navikt/aksel-icons'
import { Button, ButtonProps, Link, Tooltip } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IAuditButtonProps extends ButtonProps {
  id: string
  fontColor?: string
  auditId?: string
  marginLeft?: boolean
  marginRight?: boolean
}

export const AuditButton: FunctionComponent<IAuditButtonProps> = (props) => {
  const { id, auditId, marginLeft, marginRight, children, ...restProps } = props

  return (
    <>
      {user.isAdmin() && (
        <Link
          className={`${marginLeft ? 'ml-2' : ''} ${marginRight ? 'mr-2' : ''}`}
          href={adminAuditUrl(id) + (auditId ? `/${auditId}` : '')}
        >
          {children && children}
          {!children && (
            <>
              <Tooltip content=''>
                <Button {...restProps} icon={<ClockDashedIcon title='Versjonering' />} />
              </Tooltip>
            </>
          )}
        </Link>
      )}
      {!user.isAdmin() && null}
    </>
  )
}
