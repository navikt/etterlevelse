import { IOrgEnhet } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getAllNomAvdelinger = async () => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/avdelinger`)).data
}

export const getAvdelingOptions = async () => {
  const avdelinger = await getAllNomAvdelinger()
  if (avdelinger && avdelinger.length) {
    return avdelinger
      .map((avdeling) => {
        return {
          value: avdeling.id,
          label: avdeling.navn,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }
  return []
}

export const getSeksjonByAvdelingId = async (avdelingId: string) => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/seksjon/avdeling/${avdelingId}`))
    .data
}

export const getSeksjonOptionsByAvdelingId = async (avdelingId: string) => {
  const seksjoner = await getSeksjonByAvdelingId(avdelingId)
  if (seksjoner && seksjoner.length) {
    return seksjoner
      .map((seksjon) => {
        return {
          value: seksjon.id,
          label: seksjon.navn,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }
  return []
}
