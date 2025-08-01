import { ExternalLink } from '@/components/common/routeLink/routeLink'
import {
  etterlevelseUrl,
  temaUrl,
} from '@/components/common/routeLink/routeLinkEtterlevelsesDokumentasjon'
import { EObjectType, IAuditItem, TNavigableItem } from '@/constants/admin/audit/auditConstants'
import { adminCodelistUrl } from '@/routes/admin/kodeverk.ts/kodeverkRoutes'
import { adminVarselUrl } from '@/routes/admin/varsel/varselRoutes'
import { behandlingUrl } from '@/routes/behandlingskatalog/behandlingskatalogRoutes'
import { dokumentasjonUrl } from '@/routes/etterlevelseDokumentasjon/etterelevelseDokumentasjonRoutes'
import { kravUrl } from '@/routes/krav/kravRoutes'
import { EListName } from '@/services/codelist'
import { BodyShort } from '@navikt/ds-react'
import { AuditButton } from '../versjonering/auditView/AuditButton'

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
