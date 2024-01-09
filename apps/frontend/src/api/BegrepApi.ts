import axios from 'axios'
import { Begrep, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getBegrep = async (begrepId: string) => {
  return (await axios.get<Begrep>(`${env.backendBaseUrl}/begrep/${begrepId}`)).data
}

export const searchBegrep = async (begrepSearch: string) => {
  return (await axios.get<IPageResponse<Begrep>>(`${env.backendBaseUrl}/begrep/search/${begrepSearch}`)).data.content
}

export const mapBegrepToOption = (begrep: Begrep) => ({ id: begrep.id, label: begrep.navn + ' - ' + begrep.beskrivelse })

export const useBegrepSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchBegrep(searchParam)
    return searchResult.map((b) => {
      return { value: b.id, label: b.navn, ...b }
    })
  }
  return []
}
