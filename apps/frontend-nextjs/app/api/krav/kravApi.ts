import { IBehandling } from '@/constants/common/behandlingskatalogen/constants'
import { IPageResponse } from '@/constants/constant'
import { IKrav } from '@/constants/etterlevelse/krav/constants'
import axios from 'axios'
import { env } from 'process'

export const searchKrav = async (name: string): Promise<IKrav[]> => {
  return (await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data
    .content
}

export const searchBehandling = async (name: string): Promise<IBehandling[]> => {
  return (
    await axios.get<IPageResponse<IBehandling>>(`${env.backendBaseUrl}/behandling/search/${name}`)
  ).data.content
}

export const behandlingName = (behandling?: IBehandling): string => {
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
