import { kravPrioritingMapToFormValue } from '@/api/kravPriorityList/kravPriorityListApi'
import { IChangeStamp, IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseStatus,
  ESuksesskriterieStatus,
  IEtterlevelse,
  ISuksesskriterieBegrunnelse,
  TEtterlevelseQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonStats,
  IKravNivaaStatusFilter,
  ISuksesskriterieStatusFilter,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IAllCodelists, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, ISuksesskriterie, TKravQL } from '@/constants/krav/kravConstants'
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
  statusFilter: IKravNivaaStatusFilter,
  dataToFilter: TKravQL[]
): TKravQL[] => {
  const activeStatusFilters: string[] = (
    Object.keys(statusFilter) as (keyof IKravNivaaStatusFilter)[]
  ).filter((key) => statusFilter[key])

  const filteredData: TKravQL[] = []

  if (activeStatusFilters.includes(EEtterlevelseStatus.UNDER_REDIGERING)) {
    filteredData.push(
      ...dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          ![
            EEtterlevelseStatus.FERDIG_DOKUMENTERT,
            EEtterlevelseStatus.OPPFYLLES_SENERE,
            EEtterlevelseStatus.IKKE_PAABEGYNT,
          ].includes(krav.etterlevelser[0].status)
      )
    )
  }

  if (activeStatusFilters.includes(EEtterlevelseStatus.OPPFYLLES_SENERE)) {
    filteredData.push(
      ...dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          krav.etterlevelser[0].status === EEtterlevelseStatus.OPPFYLLES_SENERE
      )
    )
  }

  if (activeStatusFilters.includes(EEtterlevelseStatus.FERDIG_DOKUMENTERT)) {
    filteredData.push(
      ...dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length !== 0 &&
          (krav.etterlevelser[0].status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
            krav.etterlevelser[0].status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
      )
    )
  }

  if (activeStatusFilters.includes(EEtterlevelseStatus.IKKE_PAABEGYNT)) {
    filteredData.push(
      ...dataToFilter.filter(
        (krav) =>
          krav.etterlevelser.length === 0 ||
          (krav.etterlevelser.length !== 0 &&
            krav.etterlevelser[0].status === EEtterlevelseStatus.IKKE_PAABEGYNT)
      )
    )
  }

  return filteredData
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
  suksesskriterieStatusFilter: ISuksesskriterieStatusFilter,
  dataToFilter: TKravQL[]
): TKravQL[] => {
  const activeStatusFilters: string[] = (
    Object.keys(suksesskriterieStatusFilter) as (keyof ISuksesskriterieStatusFilter)[]
  ).filter((key) => suksesskriterieStatusFilter[key])

  const filteredData: TKravQL[] = []

  if (activeStatusFilters.includes(ESuksesskriterieStatus.OPPFYLT)) {
    filteredData.push(
      ...dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.OPPFYLT)
      )
    )
  }

  if (activeStatusFilters.includes(ESuksesskriterieStatus.IKKE_OPPFYLT)) {
    filteredData.push(
      ...dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.IKKE_OPPFYLT)
      )
    )
  }

  if (activeStatusFilters.includes(ESuksesskriterieStatus.IKKE_RELEVANT)) {
    filteredData.push(
      ...dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.IKKE_RELEVANT)
      )
    )
  }

  if (activeStatusFilters.includes(ESuksesskriterieStatus.UNDER_ARBEID)) {
    filteredData.push(
      ...dataToFilter.filter((krav) =>
        suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.UNDER_ARBEID)
      )
    )
  }

  if (activeStatusFilters.includes(ESuksesskriterieStatus.IKKE_PAABEGYNT)) {
    filteredData.push(
      ...dataToFilter.filter(
        (krav) =>
          suksesskriterieStatusCheck(krav, ESuksesskriterieStatus.IKKE_PAABEGYNT) ||
          krav.etterlevelser.length === 0
      )
    )
  }

  return filteredData
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

export const getKravForTema = ({
  tema,
  kravliste,
  allKravPriority,
  codelist,
}: IKravForTemaProps): TFilterKravProps[] => {
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

export type TFilterKravProps = {
  etterlevelseId: string | undefined
  etterleves: boolean
  frist: string | undefined
  etterlevelseStatus: EEtterlevelseStatus | undefined
  etterlevelseSuksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[] | undefined
  etterlevelseChangeStamp: IChangeStamp | undefined
  gammelVersjon: boolean
  kravNummer: number
  kravVersjon: number
  navn: string
  status: EKravStatus
  suksesskriterier: ISuksesskriterie[]
  tagger: string[]
  varselMelding: string | undefined
  prioriteringsId: number
  changeStamp: IChangeStamp
  aktivertDato: string
}

export const filterKrav = (
  kravPriority: IKravPriorityList,
  kravList?: TKravQL[],
  filterFerdigDokumentert?: boolean
): TFilterKravProps[] => {
  const unfilteredkraver: TKravQL[] = kravList ? _.cloneDeep(kravList) : []

  unfilteredkraver.map((krav: TKravQL) => {
    const priority: number = kravPriority.priorityList.indexOf(krav.kravNummer)
    krav.prioriteringsId = priority + 1
    return krav
  })

  const sortedKrav: TKravQL[] = sortKravListeByPriority<TKravQL>(unfilteredkraver)

  // burde types
  const mapped = sortedKrav.map((krav: TKravQL): TFilterKravProps => {
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

export const getEtterlevelseDokumentStatusText = (
  status: EEtterlevelseDokumentasjonStatus
): string => {
  switch (status) {
    case EEtterlevelseDokumentasjonStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER:
      return 'Sendt til godkjenning'
    case EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER:
      return 'Godkjent'
    default:
      return 'Ukjent'
  }
}
