import moment from 'moment'
import { EEtterlevelseStatus, ESuksesskriterieStatus, TKravQL } from '../../../constants'

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
      return 'Ferdig utfylt etterlevelse'
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return 'Ferdig utfylt etterlevelse'
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
  switch (statusFilter) {
    case EEtterlevelseStatus.UNDER_REDIGERING:
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          krav.etterlevelser[0].status !== EEtterlevelseStatus.FERDIG_DOKUMENTERT &&
          krav.etterlevelser[0].status !== EEtterlevelseStatus.OPPFYLLES_SENERE
      )
    case EEtterlevelseStatus.OPPFYLLES_SENERE:
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          krav.etterlevelser[0].status === EEtterlevelseStatus.OPPFYLLES_SENERE
      )
    case '':
      return dataToFilter.filter((krav) => krav.etterlevelser.length === 0)
    case EEtterlevelseStatus.FERDIG_DOKUMENTERT:
      return dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          (krav.etterlevelser[0].status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
            krav.etterlevelser[0].status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
      )
    default:
      return dataToFilter
  }
}

const suksesskriterieStatusCheck = (krav: TKravQL, status: ESuksesskriterieStatus) => {
  return (
    krav.etterlevelser.length !== 0 &&
    krav.etterlevelser[0].suksesskriterieBegrunnelser.length !== 0 &&
    krav.etterlevelser[0].suksesskriterieBegrunnelser.filter(
      (suksesskriterieBegrunnelse) => suksesskriterieBegrunnelse.suksesskriterieStatus === status
    ).length !== 0
  )
}

export const filterSuksesskriterieStatus = (
  suksesskriterieStatusFilter: string,
  dataToFilter: TKravQL[]
): TKravQL[] => {
  switch (suksesskriterieStatusFilter) {
    case ESuksesskriterieStatus.OPPFYLT:
      return dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.OPPFYLT)
      )
    case ESuksesskriterieStatus.IKKE_OPPFYLT:
      return dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.IKKE_OPPFYLT)
      )
    case ESuksesskriterieStatus.IKKE_RELEVANT:
      return dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.IKKE_RELEVANT)
      )
    case ESuksesskriterieStatus.UNDER_ARBEID:
      return dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.UNDER_ARBEID)
      )
    default:
      return dataToFilter
  }
}
