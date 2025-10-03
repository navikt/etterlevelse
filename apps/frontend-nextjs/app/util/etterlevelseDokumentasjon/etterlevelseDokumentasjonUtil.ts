import { IPageResponse } from '@/constants/commonConstants'
import {
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonStats,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IMember, ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import moment from 'moment'
import { getNumberOfMonthsBetween } from '../checkAge/checkAgeUtil'

export const etterlevelseDokumentasjonName = (
  etterlevelseDokumentasjon?: IEtterlevelseDokumentasjon
): string =>
  etterlevelseDokumentasjon
    ? `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`
    : ''

export const getMembersFromEtterlevelseDokumentasjon = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
): string[] => {
  const members: string[] = []
  if (etterlevelseDokumentasjon.teamsData && etterlevelseDokumentasjon.teamsData.length > 0) {
    etterlevelseDokumentasjon.teamsData.forEach((team: ITeam) => {
      if (team.members) {
        const teamMembers: string[] = team.members.map((members: IMember) => members.navIdent || '')
        members.push(...teamMembers)
      }
    })
  }
  if (
    etterlevelseDokumentasjon.resourcesData &&
    etterlevelseDokumentasjon.resourcesData.length > 0
  ) {
    members.push(
      ...etterlevelseDokumentasjon.resourcesData.map((resource: ITeamResource) => resource.navIdent)
    )
  }

  return members
}

export const filteredEtterlevelsesDokumentasjoner = (
  sortedEtterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
): TEtterlevelseDokumentasjonQL[] => {
  const today: Date = new Date()

  return sortedEtterlevelseDokumentasjoner
    .filter((etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
      let monthAge
      if (etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg) {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg,
          today
        )
      } else {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.changeStamp.createdDate || '',
          today
        )
      }
      return monthAge <= 6
    })
    .slice(0, 2)
}

export const sortEtterlevelseDokumentasjonerByUsersLastModifiedDate = (
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
) => {
  return etterlevelseDokumentasjoner.sort((a, b) => {
    if (!a.sistEndretEtterlevelseAvMeg && b.sistEndretEtterlevelseAvMeg) {
      if (a.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretEtterlevelseAvMeg).valueOf() -
          moment(a.sistEndretDokumentasjonAvMeg).valueOf()
        )
      } else {
        return 1
      }
    }
    if (!b.sistEndretEtterlevelseAvMeg && a.sistEndretEtterlevelseAvMeg) {
      if (b.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretDokumentasjonAvMeg).valueOf() -
          moment(a.sistEndretEtterlevelseAvMeg).valueOf()
        )
      } else {
        return -1
      }
    }
    if (!a.sistEndretEtterlevelseAvMeg && !b.sistEndretEtterlevelseAvMeg) {
      if (a.sistEndretDokumentasjonAvMeg && b.sistEndretDokumentasjonAvMeg) {
        return (
          moment(b.sistEndretDokumentasjonAvMeg).valueOf() -
          moment(a.sistEndretDokumentasjonAvMeg).valueOf()
        )
      } else {
        return (
          moment(b.changeStamp.createdDate).valueOf() - moment(a.changeStamp.createdDate).valueOf()
        )
      }
    } else {
      return (
        moment(b.sistEndretEtterlevelseAvMeg).valueOf() -
        moment(a.sistEndretEtterlevelseAvMeg).valueOf()
      )
    }
  })
}

export const filterEtterlevelseDokumentasjonStatsData = (
  unfilteredData:
    | {
        etterlevelseDokumentasjon: IPageResponse<{
          stats: IEtterlevelseDokumentasjonStats
        }>
      }
    | undefined
): TKravQL[][] => {
  const relevanteStatusListe: TKravQL[] = []
  const utgaattStatusListe: TKravQL[] = []

  unfilteredData?.etterlevelseDokumentasjon.content.forEach(({ stats }) => {
    relevanteStatusListe.push(...stats.relevantKrav)
    utgaattStatusListe.push(...stats.utgaattKrav)
  })

  relevanteStatusListe.sort((a: TKravQL, b: TKravQL) => {
    return a.kravNummer - b.kravNummer
  })

  utgaattStatusListe.sort((a: TKravQL, b: TKravQL) => {
    if (a.kravNummer === b.kravNummer) {
      return a.kravVersjon - b.kravVersjon
    }
    return a.kravNummer - b.kravNummer
  })

  return [relevanteStatusListe, utgaattStatusListe]
}
