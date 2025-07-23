import { IVirkemiddel } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getVirkemiddel = async (id: string): Promise<IVirkemiddel> => {
  return (await axios.get<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}
