import { EObjectType } from '@/components/kraveier/admin/audit/audit'
import { IKrav } from '@/constants/etterlevelse/krav/constants'

export const kravName = (krav: IKrav): string => `${kravNumView(krav)} ${krav.navn}`

export const kravNumView = (it: { kravVersjon: number; kravNummer: number }): string =>
  `K${it.kravNummer}.${it.kravVersjon}`

export const kravMap = (krav: IKrav) => ({
  value: krav.id,
  label: kravName(krav),
  tag: EObjectType.Krav as string,
  url: `krav/${krav.id}`,
})
