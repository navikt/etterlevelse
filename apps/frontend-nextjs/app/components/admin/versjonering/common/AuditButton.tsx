'use client'

import { UserContext } from '@/provider/user/userProvider'
import { adminAuditUrl } from '@/routes/admin/audit/auditRoutes'
import { ClockDashedIcon } from '@navikt/aksel-icons'
import { Button, ButtonProps, Link, Tooltip } from '@navikt/ds-react'
import { FunctionComponent, useContext } from 'react'

interface IAuditButtonProps extends ButtonProps {
  id: string
  fontColor?: string
  auditId?: string
  marginLeft?: boolean
  marginRight?: boolean
}

export const AuditButton: FunctionComponent<IAuditButtonProps> = (props) => {
  const { id, auditId, marginLeft, marginRight, children, ...restProps } = props
  const { isAdmin } = useContext(UserContext)
  return (
    <>
      {isAdmin() && (
        <Link
          className={`${marginLeft ? 'ml-2' : ''} ${marginRight ? 'mr-2' : ''}`}
          href={adminAuditUrl(id) + (auditId ? `?auditId=${auditId}` : '')}
        >
          {children && children}
          {!children && (
            <>
              <Tooltip content='Versjon'>
                <Button {...restProps} icon={<ClockDashedIcon title='Versjonering' />} />
              </Tooltip>
            </>
          )}
        </Link>
      )}

      {!isAdmin() && null}
    </>
  )
}
