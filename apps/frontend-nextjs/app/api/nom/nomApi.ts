import axios from 'axios'
import { IOrgEnhet } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'

const getAllNomAvdelinger = async () => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/avdelinger`)).data
}

export const getAllLinjer = async () => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/linjer`)).data
}

export const getUnderenheter = async (orgId: string) => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/underenheter/${orgId}`)).data
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

export const getLinjeOptions = async () => {
  const linjer = await getAllLinjer()
  if (linjer && linjer.length) {
    return linjer
      .map((linje) => {
        return {
          value: linje.id,
          label: linje.navn,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }
  return []
}

export const getUnderenheterOptions = async (orgId: string) => {
  const underenheter = await getUnderenheter(orgId)
  if (underenheter && underenheter.length) {
    return underenheter
      .map((underenhet) => {
        return {
          value: underenhet.id,
          label: underenhet.navn,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }
  return []
}

const getSeksjonByAvdelingId = async (avdelingId: string) => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/seksjon/avdeling/${avdelingId}`))
    .data
}

export const getEnheterBySeksjonId = async (seksjonId: string) => {
  return (await axios.get<IOrgEnhet[]>(`${env.backendBaseUrl}/nom/enhet/seksjon/${seksjonId}`)).data
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
