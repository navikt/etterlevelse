import {
  IBehandling,
  IDpBehandling,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getBehandling = async (id: string) => {
  return (await axios.get<IBehandling>(`${env.backendBaseUrl}/behandling/${id}`)).data
}

export const searchBehandling = async (name: string): Promise<IBehandling[]> => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
  ).data.content
}

export const getDpBehandling = async (id: string) => {
  return (await axios.get<IDpBehandling>(`${env.backendBaseUrl}/dpbehandling/${id}`)).data
}

export const searchDpBehandling = async (name: string): Promise<IDpBehandling[]> => {
  return (
    await axios.get<IPageResponse<IDpBehandling>>(
      `${env.backendBaseUrl}/dpbehandling/search/${name}`
    )
  ).data.content
}

export const searchBehandlingOptions = async (searchParam: string) => {
  if (searchParam && searchParam.length > 2) {
    const behandlinger = await searchBehandling(searchParam)
    if (behandlinger && behandlinger.length) {
      return behandlinger.map((behandling) => {
        return {
          value: behandling.id,
          label:
            'B' +
            behandling.nummer +
            ' ' +
            behandling.overordnetFormaal.shortName +
            ': ' +
            behandling.navn,
          ...behandling,
        }
      })
    }
  }
  return []
}

export const searchDpBehandlingOptions = async (searchParam: string) => {
  if (searchParam && searchParam.length > 2) {
    const dpBehandlinger = await searchDpBehandling(searchParam)
    if (dpBehandlinger && dpBehandlinger.length) {
      return dpBehandlinger.map((dpBehandling) => {
        return {
          value: dpBehandling.id,
          label: 'D' + dpBehandling.nummer + ' ' + dpBehandling.navn,
          ...dpBehandling,
        }
      })
    }
  }
  return []
}
