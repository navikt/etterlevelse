import { useLocation, useNavigate } from 'react-router-dom'
import React from 'react'
import { AuditItem, NavigableItem, ObjectType } from '../admin/audit/AuditTypes'
import { Block } from 'baseui/block'
import { AuditButton } from '../admin/audit/AuditButton'
import { KIND } from 'baseui/button'
import { ListName } from '../../services/Codelist'
import CustomizedLink from './CustomizedLink'
import _ from 'lodash'
import { user } from '../../services/User'
import { loginUrl } from '../Header'
import { ettlevColors } from '../../util/theme'
import { externalLinkIcon } from '../Images'

type RouteLinkProps = {
  href?: string
  hideUnderline?: boolean
  plain?: boolean
  requireLogin?: boolean
  fontColor?: string
  ariaLabel?: string
} & any

const RouteLink = (props: RouteLinkProps) => {
  const { hideUnderline, plain, requireLogin, style, fontColor, ariaLabel, ...restprops } = props
  const navigate = useNavigate()
  const location = useLocation()

  const onClick = (e: Event) => {
    if (requireLogin && !user.isLoggedIn()) return
    e.preventDefault()
    if (!href) {
      navigate(-1)
      restprops.onClick && restprops.onClick()
    }
    navigate(props.href)
    restprops.onClick && restprops.onClick()
  }

  const customStyle = {
    textDecoration: hideUnderline ? 'none' : undefined,
    color: fontColor ? fontColor : plain ? 'inherit !important' : undefined,
    fontWeight: 'normal',
  }

  const mergedStyle = _.merge(customStyle, props.style)

  const href = !requireLogin || user.isLoggedIn() ? restprops.href : loginUrl(location, restprops.href)

  return <CustomizedLink aria-label={ariaLabel} style={mergedStyle} {...restprops} href={href} onClick={onClick} />
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
  fontColor?: string
  external?: boolean
}

export const urlForObject = (type: NavigableItem | string, id: string, audit?: AuditItem) => {
  switch (type) {
    case ObjectType.Settings:
      return '/admin/settings'
    case ObjectType.Krav:
      return `/krav/${id}`
    case ObjectType.Etterlevelse:
      return `/etterlevelse/${id}`
    case ObjectType.BehandlingData:
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
    case ObjectType.Codelist:
      return `/admin/codelist/${id}`
    case ObjectType.Melding:
      return '/admin/varsel'
  }
  console.warn("couldn't find object type" + type)
  return ''
}

export const ObjectLink = (props: ObjectLinkProps) => {
  if (!props.id) return null
  let link

  if (props.disable) {
    link = props.children
  } else if (props.external) {
    link = (
      <ExternalLink fontColor={props.fontColor} href={urlForObject(props.type, props.id, props.audit)} hideUnderline={props.hideUnderline}>
        {props.children}
      </ExternalLink>
    )
  } else {
    link = (
      <RouteLink fontColor={props.fontColor} href={urlForObject(props.type, props.id, props.audit)} hideUnderline={props.hideUnderline}>
        {props.children}
      </RouteLink>
    )
  }

  return props.withHistory ? (
    <Block color={props.fontColor ? props.fontColor : ettlevColors.green800} display="flex" justifyContent="space-between" width="100%" alignItems="center">
      {link}
      <AuditButton fontColor={props.fontColor} id={props.id} kind={KIND.tertiary} />
    </Block>
  ) : (
    link
  )
}

export const ExternalLink = ({
  href,
  children,
  hideUnderline,
  label,
  fontColor,
  openOnSamePage,
}: {
  href: string
  hideUnderline?: boolean
  label?: string
  children: React.ReactNode
  fontColor?: string
  openOnSamePage?: boolean
}) => {
  return (
    <CustomizedLink
      href={href}
      target={openOnSamePage ? '_self' : '_blank'}
      rel="noopener noreferrer"
      style={{ color: fontColor ? fontColor : undefined, textDecoration: hideUnderline ? 'none' : undefined }}
      aria-label={label}
    >
      {children}
    </CustomizedLink>
  )
}

export const ExternalLinkWrapper = ({ text, fontSize }: { text: React.ReactNode; fontSize?: string }) => (
  <span style={{ display: 'inline-flex', fontSize: fontSize ? fontSize : '18px', lineHeight: '22px' }}>
    {text} <img alt="ny fane" width="inherit" height="inherit" style={{ marginLeft: '8px' }} src={externalLinkIcon} />
  </span>
)
