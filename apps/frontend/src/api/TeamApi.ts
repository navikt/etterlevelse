import axios from 'axios'
import {map, PageResponse, TeamResource} from '../constants'
import {env} from '../util/env'
import {useDebouncedState, useForceUpdate} from '../util/hooks'
import {Option} from 'baseui/select'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<TeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

export const searchResourceByName = async (resourceName: string) => {
  return (await axios.get<PageResponse<TeamResource>>(`${env.backendBaseUrl}/team/resource/search/${resourceName}`)).data
}

export const mapTeamResourceToOption = (teamResource: TeamResource) => ({id: teamResource.navIdent, label: teamResource.fullName})

export const usePersonSearch = () => {
  const [teamResourceSearch, setResourceSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setInfoTypeSearchResult] = useState<Option[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const search = async () => {
      if (teamResourceSearch && teamResourceSearch.length > 2) {
        setLoading(true)
        const res = await searchResourceByName(teamResourceSearch)
        let options: Option[] = res.content.map(mapTeamResourceToOption)
        setInfoTypeSearchResult(options)
        setLoading(false)
      }
    }
    search()
  }, [teamResourceSearch])

  return [searchResult, setResourceSearch, loading] as SearchType
}

const people: map = {}
const addPerson = (person: TeamResource, done: () => void) => {
  people[person.navIdent] = person.fullName
  done()
}

export const usePersonName = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!people[id]) getResourceById(id).then(p => addPerson(p, update)).catch(e => console.debug("err fetching person", e))
    return people[id] || id
  }
}

export type SearchType = [Option[], Dispatch<SetStateAction<string>>, boolean]
