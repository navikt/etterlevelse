import { EAlertType, IPageResponse } from '@/constants/commonConstants'
import { EMeldingStatus, EMeldingType, IMelding } from '@/constants/message/messageConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getMeldingByType = async (meldingType: EMeldingType) => {
  return (
    await axios.get<IPageResponse<IMelding>>(`${env.backendBaseUrl}/melding/type/${meldingType}`)
  ).data
}

export const mapMeldingToFormValue = (melding: Partial<IMelding>): IMelding => {
  return {
    id: melding.id || '',
    changeStamp: melding.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    meldingStatus: melding.meldingStatus || EMeldingStatus.DEACTIVE,
    meldingType: melding.meldingType || EMeldingType.FORSIDE,
    melding: melding.melding || '',
    secondaryTittel: melding.secondaryTittel || '',
    secondaryMelding: melding.secondaryMelding || '',
    alertType: melding.alertType || EAlertType.WARNING,
  }
}
