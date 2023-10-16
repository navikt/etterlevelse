import { Block, BlockProps } from 'baseui/block'
import { LabelMedium, LabelSmall } from 'baseui/typography'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PLACEMENT, StatefulTooltip } from 'baseui/tooltip'
import { faInfoCircle, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import { AuditAction } from './AuditTypes'

const labelBlockProps: BlockProps = {
  display: ['flex', 'block', 'block', 'flex'],
  width: ['20%', '100%', '100%', '20%'],
  alignSelf: 'flex-start',
}

export const AuditLabel = (props: { label: string; children: any }) => {
  return (
    <Block display="flex">
      <Block {...labelBlockProps}>
        <LabelMedium>{props.label}</LabelMedium>
      </Block>
      <Block>
        <LabelSmall>{props.children}</LabelSmall>
      </Block>
    </Block>
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
