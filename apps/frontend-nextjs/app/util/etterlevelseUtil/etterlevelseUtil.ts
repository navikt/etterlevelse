import {
  EEtterlevelseStatus,
  ISuksesskriterieBegrunnelse,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ESuksesskriterieStatus } from '@/constants/etterlevelseDokumentasjon/suksesskriterier/suksesskriterierConstant'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import _ from 'lodash'

export const etterlevelseFilter = [
  { label: 'Alle', id: 'ALLE' },
  { label: 'Oppfylt', id: ESuksesskriterieStatus.OPPFYLT },
  { label: 'Ikke relevant', id: EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT },
  { label: 'Ikke oppfylt', id: ESuksesskriterieStatus.IKKE_OPPFYLT },
]

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

export const filteredEtterlevelseSorted = (krav: TKravQL, filter: string): TEtterlevelseQL[] => {
  const etterlevelser: TEtterlevelseQL[] = etterlevelserSorted(krav)

  const filteredEtterlevelse: TEtterlevelseQL[] = etterlevelser.filter(
    (etterlevelse: TEtterlevelseQL) => {
      if (filter !== 'ALLE') {
        if (filter === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
          return (
            etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ||
            etterlevelse.suksesskriterieBegrunnelser.filter(
              (suksesskriterium: ISuksesskriterieBegrunnelse) =>
                suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_RELEVANT
            ).length > 0
          )
        } else if (filter === ESuksesskriterieStatus.IKKE_OPPFYLT) {
          return (
            etterlevelse.suksesskriterieBegrunnelser.filter(
              (suksesskriterium: ISuksesskriterieBegrunnelse) =>
                suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.IKKE_OPPFYLT
            ).length > 0
          )
        } else if (filter === ESuksesskriterieStatus.OPPFYLT) {
          return (
            etterlevelse.suksesskriterieBegrunnelser.filter(
              (suksesskriterium: ISuksesskriterieBegrunnelse) =>
                suksesskriterium.suksesskriterieStatus === ESuksesskriterieStatus.OPPFYLT
            ).length > 0
          )
        } else {
          return etterlevelse.status === filter
        }
      } else {
        return (
          etterlevelse.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
          etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
        )
      }
    }
  )

  return filteredEtterlevelse
}

export const produktOmradeSorted = (krav: TKravQL, filter: string) => {
  const produktOmrade: ITeam[] = _.sortedUniqBy(
    filteredEtterlevelseSorted(krav, filter)
      .map(
        (etterlevelse: TEtterlevelseQL) =>
          etterlevelse.etterlevelseDokumentasjon.teamsData &&
          etterlevelse.etterlevelseDokumentasjon.teamsData
      )
      .flat()
      .sort((a: ITeam | undefined, b: ITeam | undefined) =>
        (a?.productAreaName || '').localeCompare(b?.productAreaName || '')
      )
      .filter((team: ITeam | undefined) => !!team) || [],
    (a: ITeam) => a?.productAreaId
  )

  return produktOmrade
}
