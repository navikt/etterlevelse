import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { IKrav } from '@/constants/krav/kravConstants'
import { kravNummerView } from '../kravNummerView/kravNummerView'

export const kravName = (krav: IKrav): string => `${kravNummerView(krav)} ${krav.navn}`

export const kravMap = (krav: IKrav) => ({
  value: krav.id,
  label: kravName(krav),
  tag: EObjectType.Krav as string,
  url: `krav/${krav.id}`,
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
