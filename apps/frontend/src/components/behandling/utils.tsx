import moment from 'moment'
import { EEtterlevelseStatus } from '../../constants'
import { ettlevColors } from '../../util/theme'

export const getEtterlevelseStatus = (status?: EEtterlevelseStatus, frist?: string) => {
  switch (status) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EEtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ikke relevant'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Utsatt til: ' + moment(frist).format('ll')
      } else {
        return 'Utsatt'
      }
    default:
      return ''
  }
}

export const getStatusLabelColor = (status: EEtterlevelseStatus) => {
  switch (status) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EEtterlevelseStatus.FERDIG:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.green50,
        border: ettlevColors.green400,
      }
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      return {
        background: ettlevColors.warning50,
        border: '#D47B00',
      }
    default:
      return {
        background: ettlevColors.white,
        border: ettlevColors.green400,
      }
  }
}
