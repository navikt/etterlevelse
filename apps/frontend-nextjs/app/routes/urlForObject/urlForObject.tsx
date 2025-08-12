import { EObjectType, TNavigableItem } from '@/constants/admin/audit/auditConstants'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { adminCodelistUrl } from '../admin/kodeverk.ts/kodeverkRoutes'
import { adminVarselUrl } from '../admin/varsel/varselRoutes'
import { behandlingUrl } from '../behandlingskatalogen/behandlingskatalogen'
import { etterlevelseUrl } from '../etterlevelseDokumentasjon/etterlevelse/etterlevelseRoutes'
import { dokumentasjonUrl } from '../etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { temaUrl } from '../kodeverk/tema/kodeverkTemaRoutes'
import { kravUrl } from '../krav/kravRoutes'

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

// Pass pathname as an argument for SSR safety
export const paramQueryUrl = (pathname: string, tabQuery: string, paramQuery: string): string =>
  `${pathname}?tab=${tabQuery}${paramQuery}`
