import { KIND } from 'baseui/button'
import React from 'react'
import { user } from '../../../services/User'
import RouteLink from '../../common/RouteLink'
import Button from '../../common/Button'
import { intl } from '../../../util/intl/intl'
import { ClockDashedIcon } from '@navikt/aksel-icons'

export const AuditButton = (props: {
  id: string
  fontColor?: string
  auditId?: string
  kind?: (typeof KIND)[keyof typeof KIND]
  marginLeft?: boolean
  marginRight?: boolean
  children?: any
  ariaLabel?: string
}) => {
  return user.isAdmin() ? (
    <RouteLink ariaLabel={props.ariaLabel ? props.ariaLabel : undefined} fontColor={props.fontColor} href={`/admin/audit/${props.id}` + (props.auditId ? `/${props.auditId}` : '')}>
      {props.children ? (
        props.children
      ) : (
        <>
          <Button
            tooltip={intl.version}
            marginLeft={props.marginLeft}
            marginRight={props.marginRight}
            variant={props.kind || 'secondary'}
            icon={<ClockDashedIcon title="Versjonering" />}
          />
        </>
      )}
    </RouteLink>
  ) : null
}
