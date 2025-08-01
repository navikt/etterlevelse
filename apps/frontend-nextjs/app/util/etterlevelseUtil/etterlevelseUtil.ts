import {
  EEtterlevelseStatus,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'

export const etterlevelserSorted = (krav: TKravQL): TEtterlevelseQL[] => {
  const etterlevelser: TEtterlevelseQL[] = (krav.etterlevelser || [])
    .filter(
      (etterlevelse: TEtterlevelseQL) =>
        etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
        etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
    )
    .sort((a: TEtterlevelseQL, b: TEtterlevelseQL) => {
      if (a.etterlevelseDokumentasjon && b.etterlevelseDokumentasjon) {
        return a.etterlevelseDokumentasjon.title.localeCompare(b.etterlevelseDokumentasjon.title)
      } else {
        return -1
      }
    })
    .filter(
      (etterlevelse: TEtterlevelseQL) =>
        etterlevelse.etterlevelseDokumentasjon &&
        etterlevelse.etterlevelseDokumentasjon.title !== 'LEGACY_DATA'
    )

  etterlevelser.map((etterlevelse: TEtterlevelseQL) => {
    if (
      !etterlevelse.etterlevelseDokumentasjon.teamsData ||
      etterlevelse.etterlevelseDokumentasjon.teamsData.length === 0
    ) {
      etterlevelse.etterlevelseDokumentasjon.teamsData = [
        {
          id: 'INGEN_TEAM',
          name: 'Ingen team',
          description: 'ingen',
          tags: [],
          members: [],
          productAreaId: 'INGEN_PO',
          productAreaName: 'Ingen produktområde',
        },
      ]
    }
    if (etterlevelse.etterlevelseDokumentasjon.teamsData) {
      etterlevelse.etterlevelseDokumentasjon.teamsData.forEach((teamData: ITeam) => {
        if (!teamData.productAreaId && !teamData.productAreaName) {
          teamData.productAreaId = 'INGEN_PO'
          teamData.productAreaName = 'Ingen produktområde'
        }
      })
      return etterlevelse
    }
  })

  return etterlevelser
}
