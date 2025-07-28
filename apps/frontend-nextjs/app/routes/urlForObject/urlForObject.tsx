import { AuditButton } from '@/components/admin/auditButton/auditButton'
import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { IAuditItem, TNavigableItem } from '@/constants/audit/auditConstants'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { Link } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'
import { adminCodelistUrl } from '../admin/kodeverk.ts/kodeverkRoutes'
import { adminVarselUrl } from '../admin/varsel/varselRoutes'
import { behandlingUrl } from '../behandlingskatalogen/behandlingskatalogen'
import { etterlevelseUrl } from '../etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { dokumentasjonUrl } from '../etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { temaUrl } from '../kodeverk/tema/kodeverkTemaRoutes'
import { kravUrl } from '../krav/kravRoutes'

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

export const ObjectLink: FunctionComponent<TObjectLinkProps> = (props) => {
  const { id, disable, children, noNewTabLabel, type, withHistory, fontColor } = props

  if (!id) return null

  let link

  if (disable) {
    link = children
  } else
    link = (
      <ExternalLink noNewTabLabel={noNewTabLabel} href={urlForObject(type, id)}>
        {children}
      </ExternalLink>
    )

  return (
    <>
      {withHistory && (
        <div className='flex justify-between w-full items-center'>
          {link}
          <AuditButton fontColor={fontColor} id={id} variant='tertiary' />
        </div>
      )}
      {!withHistory && link}
    </>
  )
}

type TExternalLinkProps = {
  href: string
  className?: string
  label?: string
  children: ReactNode
  openOnSamePage?: boolean
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

export const paramQueryUrl = (tabQuery: string, paramQuery: string): string =>
  `${window.location.pathname}?tab=${tabQuery}${paramQuery}`
