'use client'

import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
  IKravDashboardStats,
  ITemaDashboardStats,
} from '@/constants/dashboard/dashboardConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getDashboardStats = async (): Promise<IAvdelingDashboardStats[]> => {
  const response = await axios.get<IAvdelingDashboardStats[]>(`${env.backendBaseUrl}/dashboard`)
  return response.data
}

export const getDashboardTableByAvdeling = async (
  avdelingId: string
): Promise<IDashboardTable[]> => {
  const response = await axios.get<IDashboardTable[]>(
    `${env.backendBaseUrl}/dashboard/table/avdeling/${avdelingId}`
  )
  return response.data
}

export const getDashboardAvdelingStats = async (
  avdelingId: string
): Promise<IDashboardDetailResponse> => {
  const response = await axios.get<IDashboardDetailResponse>(
    `${env.backendBaseUrl}/dashboard/avdeling/${avdelingId}`
  )
  return response.data
}

export const getTemaDashboardStats = async (
  temaCode?: string,
  avdelingId?: string,
  seksjonId?: string,
  enhetId?: string
): Promise<ITemaDashboardStats[]> => {
  const params = new URLSearchParams()
  if (temaCode) params.set('temaCode', temaCode)
  if (avdelingId) params.set('avdelingId', avdelingId)
  if (seksjonId) params.set('seksjonId', seksjonId)
  if (enhetId) params.set('enhetId', enhetId)
  const query = params.toString()
  const response = await axios.get<ITemaDashboardStats[]>(
    `${env.backendBaseUrl}/dashboard/tema${query ? `?${query}` : ''}`
  )
  return response.data
}

export const getKravDashboardStats = async (
  temaCode: string,
  avdelingId?: string,
  seksjonId?: string,
  enhetId?: string
): Promise<IKravDashboardStats[]> => {
  const params = new URLSearchParams()
  if (avdelingId) params.set('avdelingId', avdelingId)
  if (seksjonId) params.set('seksjonId', seksjonId)
  if (enhetId) params.set('enhetId', enhetId)
  const query = params.toString()
  const response = await axios.get<IKravDashboardStats[]>(
    `${env.backendBaseUrl}/dashboard/krav/${encodeURIComponent(temaCode)}${query ? `?${query}` : ''}`
  )
  return response.data
}
