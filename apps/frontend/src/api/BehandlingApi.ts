import axios from 'axios'
import { IBehandling, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getBehandling = async (id: string) => {
  return (await axios.get<IBehandling>(`${env.backendBaseUrl}/behandling/${id}`)).data
}

export const searchBehandling = async (name: string) => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
  ).data.content
}

export const behandlingName = (behandling?: IBehandling) => {
  let behandlingName = ''

  if (behandling) {
    if (behandling.nummer) {
      behandlingName += 'B' + behandling.nummer + ' '
    }
    if (behandling.overordnetFormaal && behandling.overordnetFormaal.shortName) {
      behandlingName += behandling.overordnetFormaal.shortName + ': '
    }
    if (behandling.navn) {
      behandlingName += behandling.navn
    }
  }

  return behandlingName
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
