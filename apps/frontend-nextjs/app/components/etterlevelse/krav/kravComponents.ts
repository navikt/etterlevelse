import { EKravStatus } from '@/constants/krav/kravConstants'

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
