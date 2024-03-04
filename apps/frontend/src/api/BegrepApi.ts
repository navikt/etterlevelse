import axios from 'axios'
import { IBegrep, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getBegrep = async (begrepId: string) => {
  return (await axios.get<IBegrep>(`${env.backendBaseUrl}/begrep/${begrepId}`)).data
}

export const searchBegrep = async (begrepSearch: string) => {
  return (
    await axios.get<IPageResponse<IBegrep>>(`${env.backendBaseUrl}/begrep/search/${begrepSearch}`)
  ).data.content
}

export const mapBegrepToOption = (begrep: IBegrep) => ({
  id: begrep.id,
  label: begrep.navn + ' - ' + begrep.beskrivelse,
})

export const useBegrepSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchBegrep(searchParam)
    return searchResult.map((begrep) => {
      return { value: begrep.id, label: begrep.navn, ...begrep }
    })
  }
  return []
}
