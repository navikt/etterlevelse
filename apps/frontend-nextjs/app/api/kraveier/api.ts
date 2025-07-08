import { IPageResponse } from '@/constants/constant'
import { IKrav } from '@/constants/etterlevelse/krav/constants'
import axios from 'axios'
import { env } from 'process'

export const searchKrav = async (name: string): Promise<IKrav[]> => {
  return (await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data
    .content
}
