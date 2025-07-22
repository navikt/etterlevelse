import { EAlertType, IDomainObject } from '@/constants/commonConstants'

export enum EMeldingType {
  SYSTEM = 'SYSTEM',
  FORSIDE = 'FORSIDE',
  OM_ETTERLEVELSE = 'OM_ETTERLEVELSE',
}

export enum EMeldingStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export interface IMelding extends IDomainObject {
  id: string
  melding: string
  secondaryTittel: string
  secondaryMelding: string
  meldingType: EMeldingType
  meldingStatus: EMeldingStatus
  alertType: EAlertType
}
