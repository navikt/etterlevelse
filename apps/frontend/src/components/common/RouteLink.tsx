import { Link } from '@navikt/ds-react'
import _ from 'lodash'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EListName } from '../../services/Codelist'
import { user } from '../../services/User'
import { loginUrl } from '../Header'
import { AuditButton } from '../admin/audit/AuditButton'
import { EObjectType, IAuditItem, TNavigableItem } from '../admin/audit/AuditTypes'

type TRouteLinkProps = {
  href?: string
  hideUnderline?: boolean
  plain?: boolean
  requireLogin?: boolean
  fontColor?: string
  ariaLabel?: string
  openinnewtab: boolean
} & any

const RouteLink = (props: TRouteLinkProps) => {
  const { hideUnderline, plain, requireLogin, fontColor, ariaLabel, ...restprops } = props
  const navigate = useNavigate()
  const location = useLocation()

  const onClick = (e: Event) => {
    if (requireLogin && !user.isLoggedIn()) return
    e.preventDefault()
    if (!props.href) {
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

  const href =
    !requireLogin || user.isLoggedIn() ? restprops.href : loginUrl(location, restprops.href)

  return (
    <Link
      aria-label={ariaLabel}
      style={mergedStyle}
      {...restprops}
      href={href}
      onClick={props.href && props.href.includes('https') ? undefined : onClick}
      target={props.openinnewtab ? '_blank' : undefined}
      rel={props.openinnewtab ? 'noreferrer noopener' : undefined}
    />
  )
}

export default RouteLink

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

export const urlForObject = (type: TNavigableItem | string, id: string) => {
  switch (type) {
    case EObjectType.Krav:
      return `/krav/${id}`
    case EObjectType.Etterlevelse:
      return `/etterlevelse/${id}`
    case EObjectType.EtterlevelseDokumentasjon:
      return `/dokumentasjon/${id}`
    case EObjectType.BehandlingData:
    case EObjectType.Behandling:
      return `/behandling/${id}`
    case EListName.RELEVANS:
      return `/relevans/${id}`
    case EListName.UNDERAVDELING:
      return `/underavdeling/${id}`
    case EListName.LOV:
      return `/lov/${id}` // will probably never be used
    case EListName.TEMA:
      return `/tema/${id}`
    case EObjectType.Codelist:
      return `/admin/codelist/${id}`
    case EObjectType.Melding:
      return '/admin/varsel'
  }
  console.warn("couldn't find object type" + type)
  return ''
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
    <div className="flex justify-between w-full items-center">
      {link}
      <AuditButton fontColor={props.fontColor} id={props.id} variant="tertiary" />
    </div>
  ) : (
    link
  )
}

export const ExternalLink = ({
  href,
  children,
  className,
  label,
  openOnSamePage,
  noNewTabLabel,
}: {
  href: string
  className?: string
  label?: string
  children: React.ReactNode
  openOnSamePage?: boolean
  noNewTabLabel?: boolean
}) => {
  return (
    <Link
      className={className}
      href={href}
      target={openOnSamePage ? '_self' : '_blank'}
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children} {!openOnSamePage && !noNewTabLabel && ' (åpnes i ny fane)'}
    </Link>
  )
}
