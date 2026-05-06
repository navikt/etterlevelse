import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export interface IBehandlingStatistikk {
  etterlevelseDokumentasjonsId: string
  etterlevelseDokumentasjonTittel: string
  behandlingId: string
  behandlingNavn: string
  ansvarligId: string
  ansvarlig: string
  team: string[]
  teamId: string[]
  opprettetDato: string
  endretDato: string
  totalKrav: number
  antallIkkeFiltrertKrav: number
  antallBortfiltrertKrav: number
  antallIkkePaabegynt: number
  antallUnderArbeid: number
  antallFerdigDokumentert: number
}

export interface IEtterlevelseStatistikk {
  id: string
  etterlevelseDokumentasjonId: string
  etterlevelseDokumentasjonTittel: string
  etterlevelseDokumentasjonNummer: string
  ansvarligId: string
  ansvarlig: string
  kravNummer: number
  kravVersjon: number
  etterleves: boolean
  status: string
  antallSuksesskriterie: number
  ikkeRelevantSuksesskriterieIder: number[]
  underArbeidSuksesskriterieIder: number[]
  oppfyltSuksesskriterieIder: number[]
  ikkeOppfyltSuksesskriterieIder: number[]
  team: string[]
  teamId: string[]
  tema: string
}

const fetchAllPages = async <T>(url: string): Promise<T[]> => {
  const pageSize = 500
  const firstPage = await axios.get<IPageResponse<T>>(`${url}?pageNumber=0&pageSize=${pageSize}`)
  const { content, pages } = firstPage.data
  if (pages <= 1) return content

  let all = [...content]
  for (let page = 1; page < pages; page++) {
    const resp = await axios.get<IPageResponse<T>>(`${url}?pageNumber=${page}&pageSize=${pageSize}`)
    all = [...all, ...resp.data.content]
  }
  return all
}

let etterlevelseCache: { data: IEtterlevelseStatistikk[]; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

export const getAllBehandlingStatistikk = async (): Promise<IBehandlingStatistikk[]> => {
  return fetchAllPages<IBehandlingStatistikk>(`${env.backendBaseUrl}/statistikk/behandling`)
}

export const getAllEtterlevelseStatistikk = async (): Promise<IEtterlevelseStatistikk[]> => {
  if (etterlevelseCache && Date.now() - etterlevelseCache.timestamp < CACHE_TTL_MS) {
    return etterlevelseCache.data
  }
  const data = await fetchAllPages<IEtterlevelseStatistikk>(
    `${env.backendBaseUrl}/statistikk/etterlevelse`
  )
  etterlevelseCache = { data, timestamp: Date.now() }
  return data
}
