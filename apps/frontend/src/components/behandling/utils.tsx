import {EtterlevelseStatus, KravEtterlevelseData} from "../../constants";
import {ettlevColors} from "../../util/theme";
import moment from "moment";

export const getEtterlevelseStatusLabelColor = (etterlevelse: KravEtterlevelseData) => {
  switch (etterlevelse.etterlevelseStatus) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return {
        background: ettlevColors.white,
        border: "#0B483F"
      }
    case EtterlevelseStatus.FERDIG:
      return {
        background: ettlevColors.white,
        border: "#0B483F"
      }
    case EtterlevelseStatus.IKKE_RELEVANT:
      return {
        background: ettlevColors.white,
        border: ettlevColors.grey200
      }
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.grey50,
        border: ettlevColors.grey200
      }
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return {
        background: ettlevColors.green50,
        border: ettlevColors.green400
      }
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      return {
        background: ettlevColors.warning50,
        border: "#D47B00"
      }
    default:
      return {
        background: ettlevColors.white,
        border: ettlevColors.green400
      }
  }
}

export const getEtterlevelseStatus = (etterlevelse: KravEtterlevelseData) => {
  switch (etterlevelse.etterlevelseStatus) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Under arbeid'
    case EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ikke relevant'
    case EtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Oppfylt'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      if (etterlevelse.frist) {
        return 'Oppfylles ' + moment(etterlevelse.frist).format('ll')
      } else {
        return 'Oppfylles senere'
      }
    default:
      return ''
  }
}
