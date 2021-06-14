import axios from 'axios'
import {Begrep, PageResponse} from '../constants'
import {env} from '../util/env'
import {useSearch} from '../util/hooks'

export const getBegrep = async (begrepId: string) => {
  return (await axios.get<Begrep>(`${env.backendBaseUrl}/begrep/${begrepId}`))
    .data
}

export const searchBegrep = async (begrepSearch: string) => {
  return (
    await axios.get<PageResponse<Begrep>>(
      `${env.backendBaseUrl}/begrep/search/${begrepSearch}`,
    )
  ).data.content
}

export const mapBegrepToOption = (begrep: Begrep) => ({
  id: begrep.id,
  label: begrep.navn + ' - ' + begrep.beskrivelse,
})

export const useBegrepSearch = () => useSearch(searchBegrep)
