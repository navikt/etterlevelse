import axios from 'axios'
import { IOrgEnhet } from '../constants'
import { env } from '../util/env'

export const getAllNomAvdelinger = async () => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/avdelinger`)).data
}

export const getAvdelingByNomId = async (id: string) => {
  return (await axios.get<IOrgEnhet>(`${env.backendBaseUrl}/nom/avdeling/${id}`)).data
}

export const getByNomId = async (id: string) => {
  return (await axios.get<IOrgEnhet>(`${env.backendBaseUrl}/nom/${id}`)).data
}

export const getAvdelingOptions = async () => {
  const avdelinger = await getAllNomAvdelinger()
  if (avdelinger && avdelinger.length) {
    return avdelinger.map((avdeling) => {
      return {
        value: avdeling.id,
        label: avdeling.navn,
      }
    })
  }
  return []
}
