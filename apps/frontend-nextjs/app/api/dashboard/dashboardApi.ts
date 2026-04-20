'use client'

import { getAllNomAvdelinger, getSeksjonByAvdelingId } from '@/api/nom/nomApi'
import { getAllPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { IBehandlingStatistikk, getAllBehandlingStatistikk } from '@/api/statistikk/statistikkApi'
import { IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export interface IAvdelingDashboardStats {
  avdelingId: string
  avdelingNavn: string
  dokumenter: {
    total: number
    ikkePaabegynt: number
    underArbeid: number
    godkjentAvRisikoeier: number
  }
  suksesskriterier: {
    underArbeidProsent: number
    oppfyltProsent: number
    ikkeOppfyltProsent: number
    ikkeRelevantProsent: number
  }
  behovForPvk: {
    totalMedPersonopplysninger: number
    ikkeVurdertBehov: number
    vurdertIkkeBehov: number
    behovIkkePaabegynt: number
  }
  pvk: {
    total: number
    underArbeid: number
    tilBehandlingHosPvo: number
    tilbakemeldingFraPvo: number
    godkjentAvRisikoeier: number
    pvkIWord: number
  }
}

const fetchAllPages = async <T>(url: string): Promise<T[]> => {
  const pageSize = 500
  const firstPage = (await axios.get<IPageResponse<T>>(`${url}?pageNumber=0&pageSize=${pageSize}`))
    .data
  if (firstPage.pages <= 1) return firstPage.content

  let all = [...firstPage.content]
  for (let page = 1; page < firstPage.pages; page++) {
    const resp = (
      await axios.get<IPageResponse<T>>(`${url}?pageNumber=${page}&pageSize=${pageSize}`)
    ).data
    all = [...all, ...resp.content]
  }
  return all
}

export const getDashboardStats = async (): Promise<IAvdelingDashboardStats[]> => {
  const [avdelinger, behandlingStats, dokumentasjoner, pvkDokumenter] = await Promise.all([
    getAllNomAvdelinger(),
    getAllBehandlingStatistikk(),
    fetchAllPages<IEtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon`),
    getAllPvkDokument(),
  ])

  const pvkByEtterlevelseDokId = new Map<string, IPvkDokument>()
  for (const pvk of pvkDokumenter) {
    pvkByEtterlevelseDokId.set(pvk.etterlevelseDokumentId, pvk)
  }

  const avdelingMap = new Map<
    string,
    {
      navn: string
      doks: IEtterlevelseDokumentasjon[]
      stats: IBehandlingStatistikk[]
    }
  >()

  for (const avdeling of avdelinger) {
    avdelingMap.set(avdeling.id, { navn: avdeling.navn, doks: [], stats: [] })
  }

  for (const dok of dokumentasjoner) {
    const id = dok.nomAvdelingId
    if (!id) continue
    if (!avdelingMap.has(id)) {
      avdelingMap.set(id, { navn: dok.avdelingNavn || id, doks: [], stats: [] })
    }
    avdelingMap.get(id)!.doks.push(dok)
  }

  for (const stat of behandlingStats) {
    const id = stat.ansvarligId
    if (!id) continue
    if (avdelingMap.has(id)) {
      avdelingMap.get(id)!.stats.push(stat)
    }
  }

  const result: IAvdelingDashboardStats[] = []

  for (const [avdelingId, data] of avdelingMap) {
    const { navn, doks, stats } = data

    const totalDokumenter = doks.length

    const dokIkkePaabegynt = doks.filter(
      (d) => d.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID
    ).length
    const dokUnderArbeid = doks.filter(
      (d) => d.status === EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
    ).length
    const dokGodkjent = doks.filter(
      (d) => d.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
    ).length

    let totalKrav = 0
    let ferdigDokumentert = 0
    let kravUnderArbeid = 0
    let ikkePaabegyntKrav = 0

    for (const stat of stats) {
      totalKrav += stat.totalKrav || 0
      ferdigDokumentert += stat.antallFerdigDokumentert || 0
      kravUnderArbeid += stat.antallUnderArbeid || 0
      ikkePaabegyntKrav += stat.antallIkkePaabegynt || 0
    }

    const underArbeidProsent = totalKrav > 0 ? Math.round((kravUnderArbeid / totalKrav) * 100) : 0
    const oppfyltProsent = totalKrav > 0 ? Math.round((ferdigDokumentert / totalKrav) * 100) : 0
    const ikkeOppfyltProsent = totalKrav > 0 ? Math.round((ikkePaabegyntKrav / totalKrav) * 100) : 0
    const ikkeRelevantProsent = Math.max(
      0,
      100 - underArbeidProsent - oppfyltProsent - ikkeOppfyltProsent
    )

    const doksWithPersonopplysninger = doks.filter((d) => d.behandlerPersonopplysninger)
    const totalMedPO = doksWithPersonopplysninger.length

    let ikkeVurdertBehov = 0
    let vurdertIkkeBehov = 0
    let behovIkkePaabegynt = 0

    let pvkTotal = 0
    let pvkUnderArbeid = 0
    let pvkTilBehandlingPvo = 0
    let pvkTilbakemeldingPvo = 0
    let pvkGodkjent = 0
    let pvkIWord = 0

    for (const dok of doksWithPersonopplysninger) {
      const pvk = pvkByEtterlevelseDokId.get(dok.id)
      if (!pvk) {
        if (dok.behandlerPersonopplysninger) {
          ikkeVurdertBehov++
        }
        continue
      }

      if (pvk.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) {
        vurdertIkkeBehov++
        continue
      }

      if (pvk.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) {
        pvkIWord++
        pvkTotal++
        continue
      }

      if (!pvk.hasPvkDocumentationStarted) {
        behovIkkePaabegynt++
        continue
      }

      pvkTotal++
      if (pvk.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
        pvkGodkjent++
      } else if (
        pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
        pvk.status === EPvkDokumentStatus.PVO_UNDERARBEID ||
        pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
      ) {
        pvkTilBehandlingPvo++
      } else if (
        pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO ||
        pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID
      ) {
        pvkTilbakemeldingPvo++
      } else {
        pvkUnderArbeid++
      }
    }

    result.push({
      avdelingId,
      avdelingNavn: navn,
      dokumenter: {
        total: totalDokumenter,
        ikkePaabegynt: dokIkkePaabegynt,
        underArbeid: dokUnderArbeid,
        godkjentAvRisikoeier: dokGodkjent,
      },
      suksesskriterier: {
        underArbeidProsent,
        oppfyltProsent,
        ikkeOppfyltProsent,
        ikkeRelevantProsent,
      },
      behovForPvk: {
        totalMedPersonopplysninger: totalMedPO,
        ikkeVurdertBehov,
        vurdertIkkeBehov,
        behovIkkePaabegynt,
      },
      pvk: {
        total: pvkTotal,
        underArbeid: pvkUnderArbeid,
        tilBehandlingHosPvo: pvkTilBehandlingPvo,
        tilbakemeldingFraPvo: pvkTilbakemeldingPvo,
        godkjentAvRisikoeier: pvkGodkjent,
        pvkIWord,
      },
    })
  }

  result.sort((a, b) => a.avdelingNavn.localeCompare(b.avdelingNavn))
  return result
}

export interface ISeksjonOption {
  id: string
  navn: string
}

const computeStats = (
  doks: IEtterlevelseDokumentasjon[],
  behandlingStats: IBehandlingStatistikk[],
  pvkByEtterlevelseDokId: Map<string, IPvkDokument>,
  id: string,
  navn: string
): IAvdelingDashboardStats => {
  const totalDokumenter = doks.length

  const dokIkkePaabegynt = doks.filter(
    (d) => d.status === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID
  ).length
  const dokUnderArbeid = doks.filter(
    (d) => d.status === EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
  ).length
  const dokGodkjent = doks.filter(
    (d) => d.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
  ).length

  let totalKrav = 0
  let ferdigDokumentert = 0
  let kravUnderArbeid = 0
  let ikkePaabegyntKrav = 0

  for (const stat of behandlingStats) {
    totalKrav += stat.totalKrav || 0
    ferdigDokumentert += stat.antallFerdigDokumentert || 0
    kravUnderArbeid += stat.antallUnderArbeid || 0
    ikkePaabegyntKrav += stat.antallIkkePaabegynt || 0
  }

  const underArbeidProsent = totalKrav > 0 ? Math.round((kravUnderArbeid / totalKrav) * 100) : 0
  const oppfyltProsent = totalKrav > 0 ? Math.round((ferdigDokumentert / totalKrav) * 100) : 0
  const ikkeOppfyltProsent = totalKrav > 0 ? Math.round((ikkePaabegyntKrav / totalKrav) * 100) : 0
  const ikkeRelevantProsent = Math.max(
    0,
    100 - underArbeidProsent - oppfyltProsent - ikkeOppfyltProsent
  )

  const doksWithPersonopplysninger = doks.filter((d) => d.behandlerPersonopplysninger)
  const totalMedPO = doksWithPersonopplysninger.length

  let ikkeVurdertBehov = 0
  let vurdertIkkeBehov = 0
  let behovIkkePaabegynt = 0
  let pvkTotal = 0
  let pvkUnderArbeid = 0
  let pvkTilBehandlingPvo = 0
  let pvkTilbakemeldingPvo = 0
  let pvkGodkjent = 0
  let pvkIWord = 0

  for (const dok of doksWithPersonopplysninger) {
    const pvk = pvkByEtterlevelseDokId.get(dok.id)
    if (!pvk) {
      if (dok.behandlerPersonopplysninger) ikkeVurdertBehov++
      continue
    }
    if (pvk.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) {
      vurdertIkkeBehov++
      continue
    }
    if (pvk.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) {
      pvkIWord++
      pvkTotal++
      continue
    }
    if (!pvk.hasPvkDocumentationStarted) {
      behovIkkePaabegynt++
      continue
    }
    pvkTotal++
    if (pvk.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
      pvkGodkjent++
    } else if (
      pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
      pvk.status === EPvkDokumentStatus.PVO_UNDERARBEID ||
      pvk.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
    ) {
      pvkTilBehandlingPvo++
    } else if (
      pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO ||
      pvk.status === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID
    ) {
      pvkTilbakemeldingPvo++
    } else {
      pvkUnderArbeid++
    }
  }

  return {
    avdelingId: id,
    avdelingNavn: navn,
    dokumenter: {
      total: totalDokumenter,
      ikkePaabegynt: dokIkkePaabegynt,
      underArbeid: dokUnderArbeid,
      godkjentAvRisikoeier: dokGodkjent,
    },
    suksesskriterier: {
      underArbeidProsent,
      oppfyltProsent,
      ikkeOppfyltProsent,
      ikkeRelevantProsent,
    },
    behovForPvk: {
      totalMedPersonopplysninger: totalMedPO,
      ikkeVurdertBehov,
      vurdertIkkeBehov,
      behovIkkePaabegynt,
    },
    pvk: {
      total: pvkTotal,
      underArbeid: pvkUnderArbeid,
      tilBehandlingHosPvo: pvkTilBehandlingPvo,
      tilbakemeldingFraPvo: pvkTilbakemeldingPvo,
      godkjentAvRisikoeier: pvkGodkjent,
      pvkIWord,
    },
  }
}

export interface IAvdelingDetailData {
  avdelingId: string
  avdelingNavn: string
  seksjoner: ISeksjonOption[]
  totalStats: IAvdelingDashboardStats
  statsBySeksjon: Map<string, IAvdelingDashboardStats>
  dokumentasjoner: IEtterlevelseDokumentasjon[]
  pvkByDokId: Map<string, IPvkDokument>
}

export const getAvdelingDetailStats = async (avdelingId: string): Promise<IAvdelingDetailData> => {
  const [seksjonerResult, behandlingStats, dokumentasjoner, pvkDokumenter] = await Promise.all([
    getSeksjonByAvdelingId(avdelingId).catch(() => [] as { id: string; navn: string }[]),
    getAllBehandlingStatistikk(),
    fetchAllPages<IEtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon`),
    getAllPvkDokument(),
  ])

  const seksjoner = seksjonerResult

  const pvkByEtterlevelseDokId = new Map<string, IPvkDokument>()
  for (const pvk of pvkDokumenter) {
    pvkByEtterlevelseDokId.set(pvk.etterlevelseDokumentId, pvk)
  }

  const avdelingDoks = dokumentasjoner.filter((d) => d.nomAvdelingId === avdelingId)
  const avdelingBehandlingStats = behandlingStats.filter((s) => s.ansvarligId === avdelingId)
  const avdelingNavn = avdelingDoks[0]?.avdelingNavn || avdelingId

  const totalStats = computeStats(
    avdelingDoks,
    avdelingBehandlingStats,
    pvkByEtterlevelseDokId,
    avdelingId,
    avdelingNavn
  )

  const statsBySeksjon = new Map<string, IAvdelingDashboardStats>()

  for (const seksjon of seksjoner) {
    const seksjonDoks = avdelingDoks.filter((d) =>
      d.seksjoner?.some((s) => s.nomSeksjonId === seksjon.id)
    )
    const seksjonStats = computeStats(
      seksjonDoks,
      [],
      pvkByEtterlevelseDokId,
      seksjon.id,
      seksjon.navn
    )
    statsBySeksjon.set(seksjon.id, seksjonStats)
  }

  return {
    avdelingId,
    avdelingNavn,
    seksjoner: seksjoner.map((s) => ({ id: s.id, navn: s.navn })),
    totalStats,
    statsBySeksjon,
    dokumentasjoner: avdelingDoks,
    pvkByDokId: pvkByEtterlevelseDokId,
  }
}
