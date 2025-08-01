import { AuditButton } from '@/components/admin/versjonering/AuditButton'
import { EObjectType, IAuditItem, TNavigableItem } from '@/constants/admin/audit/auditConstants'
import { adminCodelistUrl } from '@/routes/admin/kodeverk.ts/kodeverkRoutes'
import { adminVarselUrl } from '@/routes/admin/varsel/varselRoutes'
import { behandlingUrl } from '@/routes/behandlingskatalog/behandlingskatalogRoutes'
import { dokumentasjonUrl } from '@/routes/etterlevelseDokumentasjon/etterelevelseDokumentasjonRoutes'
import { etterlevelseUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { temaUrl } from '@/routes/kodeverk/tema/kodeverkTemaRoutes'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { EListName } from '@/services/codelist'
import Link from 'next/link'
import { FunctionComponent } from 'react'

type TExternalLinkProps = {
  href: string
  className?: string
  label?: string
  children: React.ReactNode
  openOnSamePage?: boolean
  noNewTabLabel?: boolean
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

export const ExternalLink: FunctionComponent<TExternalLinkProps> = ({
  href,
  children,
  className,
  label,
  openOnSamePage,
  noNewTabLabel,
}) => (
  <Link
    className={className}
    href={href}
    target={openOnSamePage ? '_self' : '_blank'}
    rel='noopener noreferrer'
    aria-label={label}
  >
    {children} {!openOnSamePage && !noNewTabLabel && ' (åpner i en ny fane)'}
  </Link>
)

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

export const urlForObject = (type: TNavigableItem | string, id: string) => {
  switch (type) {
    case EObjectType.Krav:
      return `${kravUrl}/${id}`
    case EObjectType.Etterlevelse:
      return `${etterlevelseUrl}/${id}`
    case EObjectType.EtterlevelseDokumentasjon:
      return `${dokumentasjonUrl}/${id}`
    case EObjectType.BehandlingData:
    case EObjectType.Behandling:
      return `${behandlingUrl}/${id}`
    case EListName.RELEVANS:
      return `/relevans/${id}`
    case EListName.UNDERAVDELING:
      return `/underavdeling/${id}`
    case EListName.LOV:
      return `/lov/${id}` // will probably never be used
    case EListName.TEMA:
      return `${temaUrl}/${id}`
    case EObjectType.Codelist:
      return `${adminCodelistUrl}/${id}`
    case EObjectType.Melding:
      return adminVarselUrl
  }
  console.warn("couldn't find object type" + type)
  return ''
}
