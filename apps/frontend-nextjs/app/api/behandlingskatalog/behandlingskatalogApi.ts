import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const searchBehandling = async (name: string): Promise<IBehandling[]> => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
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
