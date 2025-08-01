import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { IKrav } from '@/constants/krav/kravConstants'

export const kravName = (krav: IKrav): string => `${kravNumView(krav)} ${krav.navn}`

export const kravNumView = (it: { kravVersjon: number; kravNummer: number }): string =>
  `K${it.kravNummer}.${it.kravVersjon}`

export const kravMap = (krav: IKrav) => ({
  value: krav.id,
  label: kravName(krav),
  tag: EObjectType.Krav as string,
  url: `krav/${krav.id}`,
})
