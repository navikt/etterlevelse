import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { kravPathUrl, kravUrl } from '@/routes/krav/kravRoutes'

export const kravName = (krav: IKrav): string =>
  `${kravNummerView(krav.kravVersjon, krav.kravNummer)} ${krav.navn}`

export const kravMap = (krav: IKrav) => ({
  value: krav.id,
  label: kravName(krav),
  tag: EObjectType.Krav as string,
  url: `/krav/${krav.id}`,
})

export const sortKravListeByPriority = <T extends IKrav>(kraver: T[]) => {
  const newKravList = [...kraver]

  return newKravList.sort((a, b) => {
    if (a.prioriteringsId !== 0 && b.prioriteringsId === 0) {
      return -1
    } else if (a.prioriteringsId === 0 && b.prioriteringsId !== 0) {
      return 1
    } else if (a.prioriteringsId === 0 && b.prioriteringsId === 0) {
      return b.kravNummer - a.kravNummer
    } else if (a.prioriteringsId && b.prioriteringsId) {
      return a.prioriteringsId - b.prioriteringsId
    } else {
      return -1
    }
  })
}

export const kravNummerView = (kravVersjon: number, kravNummer: number): string => {
  return `K${kravNummer}.${kravVersjon}`
}

export const hasKravExpired = (alleKravVersjoner: IKravVersjon[], krav?: TKravQL): boolean => {
  if (krav?.status === EKravStatus.UTGAATT && alleKravVersjoner.length === 1) {
    return true
  } else {
    return krav ? krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString()) : false
  }
}

export const kravStatus = (status: EKravStatus | string) => {
  if (!status) return ''
  switch (status) {
    case EKravStatus.UTKAST:
      return 'Utkast'
    case EKravStatus.AKTIV:
      return 'Aktiv'
    case EKravStatus.UTGAATT:
      return 'Utgått'
    default:
      return status
  }
}

export const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({
  kravNummer: it.kravNummer,
  kravVersjon: it.kravVersjon,
})

export const getNextKravUrl = (nextKravPath: string): string => {
  const currentPath: string[] = location.pathname.split(kravUrl)
  return kravPathUrl(currentPath[0], nextKravPath)
}
