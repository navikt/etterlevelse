'use client'

import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
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
