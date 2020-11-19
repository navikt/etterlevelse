import { KIND, SIZE as ButtonSize } from 'baseui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHistory } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { user } from '../../../services/User'
import RouteLink from '../../common/RouteLink'
import Button from '../../common/Button'
import { intl } from '../../../util/intl/intl'

export const AuditButton = (props: { id: string, auditId?: string, kind?: KIND[keyof KIND], marginLeft?: boolean, marginRight?: boolean, children?: any }) => {
  return user.isAdmin() ?
    <RouteLink href={`/admin/audit/${props.id}` + (props.auditId ? `/${props.auditId}` : '')}>
      {props.children ? props.children :
        <>
          <Button
            tooltip={intl.version}
            marginLeft={props.marginLeft}
            marginRight={props.marginRight}
            size={ButtonSize.compact}
            kind={props.kind || 'outline'}
          >
            <FontAwesomeIcon icon={faHistory}/>
          </Button>
        </>
      }
    </RouteLink>
    : null
}
