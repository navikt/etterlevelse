import {useHistory} from 'react-router-dom'
import {StyledLink} from 'baseui/link'
import React from 'react'
import {AuditItem, NavigableItem, ObjectType} from '../admin/audit/AuditTypes'
import {Block} from 'baseui/block'
import {AuditButton} from '../admin/audit/AuditButton'
import {KIND} from 'baseui/button'
import {ListName} from '../../services/Codelist'

type RouteLinkProps = {
  href: string,
  hideUnderline?: boolean
  plain?: boolean
} & any

const RouteLink = (props: RouteLinkProps) => {
  const {hideUnderline, plain, ...restprops} = props
  const history = useHistory()

  const onClick = (e: Event) => {
    e.preventDefault()
    history.push(props.href)
  }

  return (
    <StyledLink style={{
      textDecoration: hideUnderline ? 'none' : undefined,
      color: plain ? 'inherit !important' : undefined
    }} {...restprops} onClick={onClick}/>
  )
}

export default RouteLink

type ObjectLinkProps = {
  id?: string
  type: NavigableItem
  audit?: AuditItem
  withHistory?: boolean
  children?: any
  disable?: boolean
  hideUnderline?: boolean
}

export const urlForObject = (type: NavigableItem, id: string, audit?: AuditItem) => {
  switch (type) {
    case ObjectType.Settings:
      return '/admin/settings'
    case ObjectType.Krav:
      return `/krav/${id}`
    case ObjectType.Etterlevelse:
      return `/etterlevelse/${id}`
    case ObjectType.Behandling:
      return `/behandling/${id}`
    case ListName.RELEVANS:
      return `/relevans/${id}`
    case ListName.UNDERAVDELING:
      return `/underavdeling/${id}`
    case ListName.LOV:
      return `/lov/${id}`
    case ListName.TEMA:
      return `/tema/${id}`
    case 'codelist':
      return `/admin/codelist/${id}`
  }
  console.warn('couldn\'t find object type ' + type)
  return ''
}

export const ObjectLink = (props: ObjectLinkProps) => {
  if (!props.id) return null
  const link =
    props.disable ? props.children :
      <RouteLink href={urlForObject(props.type, props.id, props.audit)}
                 hideUnderline={props.hideUnderline}>
        {props.children}
      </RouteLink>

  return props.withHistory ?
    <Block display="flex" justifyContent="space-between" width="100%" alignItems="center">
      {link}
      <AuditButton id={props.id} kind={KIND.tertiary}/>
    </Block> :
    link
}

export const ExternalLink = ({href, children, hideUnderline, label, fontColor}: {
  href: string, hideUnderline?: boolean, label?: string
  children: React.ReactNode, fontColor?: string
}) => {
  return (
    <StyledLink href={href} target="_blank" rel="noopener noreferrer" style={{color: fontColor ? fontColor : undefined ,textDecoration: hideUnderline ? 'none' : undefined}} aria-label={label}>
      {children}
    </StyledLink>
  )
}
