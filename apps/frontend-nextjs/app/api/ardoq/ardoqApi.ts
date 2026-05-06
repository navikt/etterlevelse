import { IArdoqSystem } from '@/constants/ardoqSystem/ardoqSystemConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getArdoqSystemeById = async (ardoqId: string) => {
  return (await axios.get<IArdoqSystem>(`${env.backendBaseUrl}/ardoq/${ardoqId}`)).data
}

export const getAlleArdoqSystemer = async () => {
  return (await axios.get<IArdoqSystem[]>(`${env.backendBaseUrl}/ardoq/system`)).data
}

export const getSeachArdoqSystemerBySearchParam = async (searchParam: string) => {
  return (await axios.get<IArdoqSystem[]>(`${env.backendBaseUrl}/ardoq/search/${searchParam}`)).data
}
