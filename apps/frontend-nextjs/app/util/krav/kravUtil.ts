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
