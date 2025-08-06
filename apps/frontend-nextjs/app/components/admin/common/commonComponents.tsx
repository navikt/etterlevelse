import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IAuditItem, TNavigableItem } from '@/constants/admin/audit/auditConstants'
import { urlForObject } from '@/routes/urlForObject/urlForObject'
import { BodyShort } from '@navikt/ds-react'
import { AuditButton } from '../versjonering/common/AuditButton'

export const UpdateMessage = ({ message }: { message?: string }) => {
  return (
    <div>
      {message ? (
        <div>
          {message.match('error') ? (
            <BodyShort className='text-nav-red'>{message}</BodyShort>
          ) : (
            <BodyShort>{message}</BodyShort>
          )}
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}

type TObjectLinkProps = {
  id?: string
  type: TNavigableItem
  audit?: IAuditItem
  withHistory?: boolean
  children?: any
  disable?: boolean
  hideUnderline?: boolean
  fontColor?: string
  external?: boolean
  noNewTabLabel?: boolean
}

export const ObjectLink = (props: TObjectLinkProps) => {
  if (!props.id) return null
  let link

  if (props.disable) {
    link = props.children
  } else
    link = (
      <ExternalLink noNewTabLabel={props.noNewTabLabel} href={urlForObject(props.type, props.id)}>
        {props.children}
      </ExternalLink>
    )

  return props.withHistory ? (
    <div className='flex justify-between w-full items-center'>
      {link}
      <AuditButton fontColor={props.fontColor} id={props.id} variant='tertiary' />
    </div>
  ) : (
    link
  )
}
