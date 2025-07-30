import { EKravStatus, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'

export const hasKravExpired = (
  krav: TKravQL | undefined,
  alleKravVersjoner: IKravVersjon[]
): boolean => {
  if (krav?.status === EKravStatus.UTGAATT && alleKravVersjoner.length === 1) {
    return true
  } else {
    return krav ? krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString()) : false
  }
}
