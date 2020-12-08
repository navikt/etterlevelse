import axios from 'axios'
import {PageResponse, Team, TeamResource} from '../constants'
import {env} from '../util/env'
import {useDebouncedState, useForceUpdate} from '../util/hooks'
import {Option} from 'baseui/select'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {user} from '../services/User'

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<TeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

export const searchResourceByName = async (resourceName: string) => {
  return (await axios.get<PageResponse<TeamResource>>(`${env.backendBaseUrl}/team/resource/search/${resourceName}`)).data
}

export const getTeam = async (teamId: string) => {
  const data = (await axios.get<Team>(`${env.backendBaseUrl}/team/${teamId}`)).data
  data.members = data.members.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return data
}

export const myTeams = async () => {
  return (await axios.get<PageResponse<Team>>(`${env.backendBaseUrl}/team?myTeams=true`)).data.content
}

export const searchTeam = async (teamSearch: string) => {
  return (await axios.get<PageResponse<Team>>(`${env.backendBaseUrl}/team/search/${teamSearch}`)).data
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

const people: Map<string, string> = new Map<string, string>()
const teams: Map<string, Team> = new Map<string, Team>()

const addPerson = (person: TeamResource, done: () => void) => {
  people.set(person.navIdent, person.fullName)
  done()
}

const addTeam = (team: Team, done: () => void) => {
  teams.set(team.id, team)
  done()
}

export const usePersonName = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!people.has(id)) getResourceById(id).then(p => addPerson(p, update)).catch(e => console.debug('err fetching person', e))
    return people.get(id) || id
  }
}

export const useTeam = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!teams.has(id)) getTeam(id).then(p => addTeam(p, update)).catch(e => console.debug('err fetching team', e))
    const team = teams.get(id)
    return [team?.name || id, team] as [string, Team | undefined]
  }
}

export const useMyTeams = () => {
  const [data, setData] = useState<Team []>([])

  useEffect(() => {
    user.isLoggedIn() && myTeams().then(setData).catch(e => {
      setData([])
      console.log('couldn\'t find teams', e)
    })
  }, [user.getIdent()])

  return data
}

export type SearchType = [Option[], Dispatch<SetStateAction<string>>, boolean]
