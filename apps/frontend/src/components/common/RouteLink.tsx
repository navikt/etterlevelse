import { Link } from '@navikt/ds-react'
import React from 'react'
import { EListName } from '../../services/Codelist'
import { AuditButton } from '../admin/audit/AuditButton'
import { EObjectType, IAuditItem, TNavigableItem } from '../admin/audit/AuditTypes'

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
