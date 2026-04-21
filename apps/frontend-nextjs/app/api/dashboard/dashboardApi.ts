'use client'

import { getAllPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getAllBehandlingStatistikk } from '@/api/statistikk/statistikkApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { IPageResponse } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
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

export const getDashboardStats = async (): Promise<IAvdelingDashboardStats[]> => {
  const response = await axios.get<IAvdelingDashboardStats[]>(`${env.backendBaseUrl}/dashboard`)
  return response.data
}

export interface ISeksjonOption {
  id: string
  navn: string
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

export interface IDokKravStats {
  totalKrav: number
  ferdigDokumentert: number
  underArbeid: number
  ikkePaabegynt: number
  behandlinger: { id: string; navn: string; nummer: number }[]
}

export interface IDokPvkStats {
  antallScenarioer: number
  hoyRisikoScenarioer: number
  hoyRisikoEtterTiltak: number
  ikkeIverksatteTiltak: number
  tiltakFristPassert: number
}

export interface IAvdelingDetailData {
  avdelingId: string
  avdelingNavn: string
  seksjoner: ISeksjonOption[]
  totalStats: IAvdelingDashboardStats
  statsBySeksjon: Map<string, IAvdelingDashboardStats>
  dokumentasjoner: IEtterlevelseDokumentasjon[]
  pvkByDokId: Map<string, IPvkDokument>
  kravStatsByDokId: Map<string, IDokKravStats>
  pvkStatsByDokId: Map<string, IDokPvkStats>
}

interface IDashboardDetailResponse extends IAvdelingDashboardStats {
  seksjoner: ISeksjonOption[]
  statsBySeksjon: Record<string, IAvdelingDashboardStats>
}

export const getAvdelingDetailStats = async (avdelingId: string): Promise<IAvdelingDetailData> => {
  const [dashboardResponse, behandlingStats, dokumentasjoner, pvkDokumenter] = await Promise.all([
    axios
      .get<IDashboardDetailResponse>(`${env.backendBaseUrl}/dashboard/${avdelingId}`)
      .then((r) => r.data),
    getAllBehandlingStatistikk(),
    fetchAllPages<IEtterlevelseDokumentasjon>(`${env.backendBaseUrl}/etterlevelsedokumentasjon`),
    getAllPvkDokument(),
  ])

  const pvkByEtterlevelseDokId = new Map<string, IPvkDokument>()
  for (const pvk of pvkDokumenter) {
    pvkByEtterlevelseDokId.set(pvk.etterlevelseDokumentId, pvk)
  }

  const avdelingDoks = dokumentasjoner.filter((d) => d.nomAvdelingId === avdelingId)

  const relevantPvkIds = avdelingDoks
    .map((d) => pvkByEtterlevelseDokId.get(d.id))
    .filter((pvk): pvk is IPvkDokument => !!pvk)
    .map((pvk) => pvk.id)

  const [scenarioResults, tiltakResults] = await Promise.all([
    Promise.all(
      relevantPvkIds.map((pvkId) =>
        getRisikoscenarioByPvkDokumentId(pvkId, ERisikoscenarioType.ALL)
          .then((r) => r.content)
          .catch(() => [] as IRisikoscenario[])
      )
    ),
    Promise.all(
      relevantPvkIds.map((pvkId) =>
        getTiltakByPvkDokumentId(pvkId)
          .then((r) => r.content)
          .catch(() => [] as ITiltak[])
      )
    ),
  ])

  const risikoscenarioer = scenarioResults.flat()
  const tiltak = tiltakResults.flat()

  const statsBySeksjon = new Map<string, IAvdelingDashboardStats>()
  if (dashboardResponse.statsBySeksjon) {
    for (const [seksjonId, stats] of Object.entries(dashboardResponse.statsBySeksjon)) {
      statsBySeksjon.set(seksjonId, stats)
    }
  }

  const avdelingDokIds = new Set(avdelingDoks.map((d) => d.id))

  const kravStatsByDokId = new Map<string, IDokKravStats>()
  for (const stat of behandlingStats) {
    if (!avdelingDokIds.has(stat.etterlevelseDokumentasjonsId)) continue
    const existing = kravStatsByDokId.get(stat.etterlevelseDokumentasjonsId)
    if (existing) {
      existing.totalKrav += stat.totalKrav || 0
      existing.ferdigDokumentert += stat.antallFerdigDokumentert || 0
      existing.underArbeid += stat.antallUnderArbeid || 0
      existing.ikkePaabegynt += stat.antallIkkePaabegynt || 0
      existing.behandlinger.push({
        id: stat.behandlingId,
        navn: stat.behandlingNavn,
        nummer: parseInt(stat.behandlingId.replace(/\D/g, '')) || 0,
      })
    } else {
      kravStatsByDokId.set(stat.etterlevelseDokumentasjonsId, {
        totalKrav: stat.totalKrav || 0,
        ferdigDokumentert: stat.antallFerdigDokumentert || 0,
        underArbeid: stat.antallUnderArbeid || 0,
        ikkePaabegynt: stat.antallIkkePaabegynt || 0,
        behandlinger: [
          {
            id: stat.behandlingId,
            navn: stat.behandlingNavn,
            nummer: parseInt(stat.behandlingId.replace(/\D/g, '')) || 0,
          },
        ],
      })
    }
  }

  const isHoyRisiko = (s: number, k: number): boolean =>
    k >= 5 || s >= 5 || (k >= 4 && s >= 3) || (k >= 3 && s >= 4)

  const scenarioerByPvkId = new Map<string, IRisikoscenario[]>()
  for (const scenario of risikoscenarioer) {
    const list = scenarioerByPvkId.get(scenario.pvkDokumentId) || []
    list.push(scenario)
    scenarioerByPvkId.set(scenario.pvkDokumentId, list)
  }

  const tiltakByPvkId = new Map<string, ITiltak[]>()
  for (const t of tiltak) {
    const list = tiltakByPvkId.get(t.pvkDokumentId) || []
    list.push(t)
    tiltakByPvkId.set(t.pvkDokumentId, list)
  }

  const now = new Date()
  const pvkStatsByDokId = new Map<string, IDokPvkStats>()
  for (const dok of avdelingDoks) {
    const pvk = pvkByEtterlevelseDokId.get(dok.id)
    if (!pvk) continue

    const scenarios = scenarioerByPvkId.get(pvk.id) || []
    const pvkTiltak = tiltakByPvkId.get(pvk.id) || []

    pvkStatsByDokId.set(dok.id, {
      antallScenarioer: scenarios.length,
      hoyRisikoScenarioer: scenarios.filter((s) =>
        isHoyRisiko(s.sannsynlighetsNivaa, s.konsekvensNivaa)
      ).length,
      hoyRisikoEtterTiltak: scenarios.filter((s) =>
        isHoyRisiko(s.sannsynlighetsNivaaEtterTiltak, s.konsekvensNivaaEtterTiltak)
      ).length,
      ikkeIverksatteTiltak: pvkTiltak.filter((t) => !t.iverksatt).length,
      tiltakFristPassert: pvkTiltak.filter(
        (t) => !t.iverksatt && t.frist && new Date(t.frist) < now
      ).length,
    })
  }

  return {
    avdelingId,
    avdelingNavn: dashboardResponse.avdelingNavn,
    seksjoner: dashboardResponse.seksjoner || [],
    totalStats: dashboardResponse,
    statsBySeksjon,
    dokumentasjoner: avdelingDoks,
    pvkByDokId: pvkByEtterlevelseDokId,
    kravStatsByDokId,
    pvkStatsByDokId,
  }
}
