import { kravPrioritingMapToFormValue } from '@/api/kravPriorityList/kravPriorityListApi'
import { IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonStats,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IAllCodelists, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { IMember, ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import _ from 'lodash'
import moment from 'moment'
import { getNumberOfMonthsBetween } from '../checkAge/checkAgeUtil'
import { sortKravListeByPriority } from '../krav/kravUtil'

export const etterlevelseDokumentasjonName = (
  etterlevelseDokumentasjon?: IEtterlevelseDokumentasjon
): string =>
  etterlevelseDokumentasjon
    ? `E${etterlevelseDokumentasjon.etterlevelseNummer}.${etterlevelseDokumentasjon.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon.title}`
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

export const filterKravEtterlevelseStatus = (
  statusFilter: string,
  dataToFilter: TKravQL[]
): TKravQL[] => {
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

export const getNewestKravVersjon = (list: any[]) => {
  let relevanteStatusListe = [...list]

  relevanteStatusListe = relevanteStatusListe.filter(
    (value, index, self) => index === self.findIndex((k) => k.kravNummer === value.kravNummer)
  )

  return relevanteStatusListe
}

export const isFerdigUtfylt = (status: EEtterlevelseStatus | undefined) => {
  return (
    status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
    status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ||
    status === EEtterlevelseStatus.OPPFYLLES_SENERE
  )
}

interface IKravForTemaProps {
  tema: TTemaCode
  kravliste: TKravQL[]
  allKravPriority: IKravPriorityList[]
  codelist: {
    utils: ICodelistProps
    lists: IAllCodelists
  }
}

export const getKravForTema = (props: IKravForTemaProps) => {
  const { tema, kravliste, allKravPriority, codelist } = props

  const lover: TLovCode[] = codelist.utils.getLovCodesForTema(tema.code)
  const lovCodes: string[] = lover.map((lov: TLovCode) => lov.code)
  const krav: TKravQL[] = kravliste.filter((krav: TKravQL) =>
    krav.regelverk
      .map((regelverk: any) => regelverk.lov.code)
      .some((lov: any) => lovCodes.includes(lov))
  )
  const kravPriorityForTema: IKravPriorityList = allKravPriority.filter(
    (kravPriority) => kravPriority.temaId === tema.code
  )[0]

  const kravPriority: IKravPriorityList = kravPriorityForTema
    ? kravPriorityForTema
    : kravPrioritingMapToFormValue({})

  return filterKrav(kravPriority, krav)
}

export const filterKrav = (
  kravPriority: IKravPriorityList,
  kravList?: TKravQL[],
  filterFerdigDokumentert?: boolean
) => {
  const unfilteredkraver: TKravQL[] = kravList ? _.cloneDeep(kravList) : []

  unfilteredkraver.map((krav: TKravQL) => {
    const priority: number = kravPriority.priorityList.indexOf(krav.kravNummer)
    krav.prioriteringsId = priority + 1
    return krav
  })

  const sortedKrav: TKravQL[] = sortKravListeByPriority<TKravQL>(unfilteredkraver)

  // burde types
  const mapped = sortedKrav.map((krav: TKravQL) => {
    const etterlevelse: TEtterlevelseQL | undefined = krav.etterlevelser.length
      ? krav.etterlevelser[0]
      : undefined
    return {
      kravNummer: krav.kravNummer,
      kravVersjon: krav.kravVersjon,
      navn: krav.navn,
      status: krav.status,
      suksesskriterier: krav.suksesskriterier,
      varselMelding: krav.varselMelding,
      prioriteringsId: krav.prioriteringsId,
      changeStamp: krav.changeStamp,
      aktivertDato: krav.aktivertDato,
      tagger: krav.tagger,
      ...mapEtterlevelseData(etterlevelse),
    }
  })

  if (filterFerdigDokumentert) {
    for (let index = mapped.length - 1; index > 0; index--) {
      if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped[index - 1].gammelVersjon = true
      } else if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus !== EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped.splice(index - 1, 1)
      }
    }
  }
  return mapped
}

export const mapEtterlevelseData = (etterlevelse?: IEtterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status,
  etterlevelseSuksesskriterieBegrunnelser: etterlevelse?.suksesskriterieBegrunnelser,
  etterlevelseChangeStamp: etterlevelse?.changeStamp,
  gammelVersjon: false,
})
