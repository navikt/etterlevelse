import axios from 'axios'
import {map, PageResponse, TeamResource} from '../constants'
import {env} from '../util/env'
import {useDebouncedState} from '../util/hooks'
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

export const usePersonLookup = () => {
  const [ids, setIds] = useState<string[]>([])
  const [people, setPeople] = useState<map>({})

  useEffect(() => {
    (async () => {
      const next: map = {...people}
      const tasks: Promise<any>[] = []
      for (const id of ids) {
        if (!people[id]) {
          tasks.push((async () => {
            const person = await getResourceById(id)
            next[id] = person.fullName
          })())
        }
      }
      await Promise.all(tasks)
      setPeople(next)
    })()
  }, [ids])

  const lookup = (id: string) => {
    if (ids.indexOf(id) < 0) setIds([...ids, id])
    return people[id] || id
  }

  return lookup
}

export type SearchType = [Option[], Dispatch<SetStateAction<string>>, boolean]
