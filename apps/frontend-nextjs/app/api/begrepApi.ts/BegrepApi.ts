import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'


export const searchBegrep = async (begrepSearch: string) => {
  return (
    await axios.get<IPageResponse<IBegrep>>(`${env.backendBaseUrl}/begrep/search/${begrepSearch}`)
  ).data.content
}

export const useBegrepSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchBegrep(searchParam)
    return searchResult.map((begrep) => {
      return { value: begrep.id, label: begrep.navn, ...begrep }
    })
  }
  return []
}
