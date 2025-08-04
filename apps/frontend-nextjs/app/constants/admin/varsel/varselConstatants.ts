import { EMeldingType } from '@/constants/message/messageConstants'

export type TWarningSection =
  | 'utsendtMelding'
  | EMeldingType.SYSTEM
  | EMeldingType.FORSIDE
  | EMeldingType.OM_ETTERLEVELSE
