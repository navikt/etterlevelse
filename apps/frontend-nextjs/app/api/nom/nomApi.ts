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
