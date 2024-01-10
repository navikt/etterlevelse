import moment from 'moment'
import { EtterlevelseStatus } from '../../constants'
import { ettlevColors } from '../../util/theme'

export const getEtterlevelseStatus = (status?: EtterlevelseStatus, frist?: string) => {
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ikke relevant'
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Utsatt til: ' + moment(frist).format('ll')
      } else {
        return 'Utsatt'
      }
    default:
      return ''
  }
}

export const getStatusLabelColor = (status: EtterlevelseStatus) => {
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EtterlevelseStatus.FERDIG:
      return {
        background: ettlevColors.white,
        border: '#0B483F',
      }
    case EtterlevelseStatus.IKKE_RELEVANT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200,
      }
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.green50,
        border: ettlevColors.green400,
      }
    case EtterlevelseStatus.OPPFYLLES_SENERE:
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
