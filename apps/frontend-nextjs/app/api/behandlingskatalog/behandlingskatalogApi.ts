import { IBehandling } from '@/constants/common/behandlingskatalogen/constants'
import { IPageResponse } from '@/constants/constant'
import { env } from '@/util/env/env'
import axios from 'axios'

export const searchBehandling = async (name: string): Promise<IBehandling[]> => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
  ).data.content
}
