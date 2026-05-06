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

export const useArdoqSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await getSeachArdoqSystemerBySearchParam(searchParam)
    return searchResult.map((system) => {
      return { value: system.ardoqID, label: system.navn, ...system }
    })
  }
  return []
}
