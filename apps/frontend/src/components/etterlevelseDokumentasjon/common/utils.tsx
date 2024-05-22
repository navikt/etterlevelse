import moment from 'moment'
import { EEtterlevelseStatus, TKravQL } from '../../../constants'

export const getNewestKravVersjon = (list: any[]) => {
  let relevanteStatusListe = [...list]

  relevanteStatusListe = relevanteStatusListe.filter(
    (value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer)
  )

  return relevanteStatusListe
}

export const getEtterlevelseStatus = (status?: EEtterlevelseStatus, frist?: string) => {
  switch (status) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return 'Under arbeid'
    case EEtterlevelseStatus.FERDIG:
      return 'Under arbeid'
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'Ikke relevant'
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      if (frist) {
        return 'Utsatt til ' + moment(frist).format('ll')
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
      return 'info'
    case EEtterlevelseStatus.FERDIG:
      return 'info'
    case EEtterlevelseStatus.IKKE_RELEVANT:
      return 'neutral'
    case EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT:
      return 'success'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'success'
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      return 'warning'
    default:
      return 'neutral'
  }
}

export const filterStatus = (statusFilter: string, dataToFilter: TKravQL[]): TKravQL[] => {
  if (statusFilter === EEtterlevelseStatus.UNDER_REDIGERING) {
    return dataToFilter.filter(
      (krav) =>
        krav.etterlevelser.length !== 0 &&
        krav.etterlevelser[0].status !== EEtterlevelseStatus.FERDIG_DOKUMENTERT &&
        krav.etterlevelser[0].status !== EEtterlevelseStatus.OPPFYLLES_SENERE
    )
  } else if (statusFilter === EEtterlevelseStatus.OPPFYLLES_SENERE) {
    return dataToFilter.filter(
      (krav) =>
        krav.etterlevelser.length !== 0 &&
        krav.etterlevelser[0].status === EEtterlevelseStatus.OPPFYLLES_SENERE
    )
  } else if (statusFilter === '') {
    return dataToFilter.filter((krav) => krav.etterlevelser.length === 0)
  } else if (statusFilter === EEtterlevelseStatus.FERDIG_DOKUMENTERT) {
    return dataToFilter.filter(
      (krav) =>
        krav.etterlevelser.length !== 0 &&
        (krav.etterlevelser[0].status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
          krav.etterlevelser[0].status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
    )
  } else {
    return dataToFilter
  }
}
