import axios from 'axios'
import {PageResponse, SlackChannel, SlackUser, Team, TeamResource} from '../constants'
import {env} from '../util/env'
import {useForceUpdate, useSearch} from '../util/hooks'
import {Option} from 'baseui/select'
import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {user} from '../services/User'

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<TeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

export const searchResourceByName = async (resourceName: string) => {
  return (await axios.get<PageResponse<TeamResource>>(`${env.backendBaseUrl}/team/resource/search/${resourceName}`)).data.content
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

export const getSlackChannelById = async (id: string) => {
  return (await axios.get<SlackChannel>(`${env.backendBaseUrl}/team/slack/channel/${id}`)).data
}

export const getSlackUserByEmail = async (id: string) => {
  return (await axios.get<SlackUser>(`${env.backendBaseUrl}/team/slack/user/email/${id}`)).data
}

export const getSlackUserById = async (id: string) => {
  return (await axios.get<SlackUser>(`${env.backendBaseUrl}/team/slack/user/id/${id}`)).data
}

export const searchSlackChannel = async (name: string) => {
  return (await axios.get<PageResponse<SlackChannel>>(`${env.backendBaseUrl}/team/slack/channel/search/${name}`)).data.content
}

export const mapTeamResourceToOption = (teamResource: TeamResource) => ({id: teamResource.navIdent, label: teamResource.fullName})

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
    if (!people.has(id)) {
      people.set(id, id)
      getResourceById(id)
      .then(p => addPerson(p, update))
      .catch(e => console.debug('err fetching person', e))
    }
    return people.get(id) || id
  }
}

export const useTeam = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!teams.has(id)) {
      teams.set(id, {id, name: id, description: '', members: [], tags: []})
      getTeam(id)
      .then(p => addTeam(p, update))
      .catch(e => console.debug('err fetching team', e))
    }
    const team = teams.get(id)
    return [team?.name || id, team] as [string, Team | undefined]
  }
}

export const useMyTeams = () => {
  const [data, setData] = useState<Team []>([])
  const ident = user.getIdent()

  useEffect(() => {
    ident && myTeams().then(setData).catch(e => {
      setData([])
      console.log('couldn\'t find teams', e)
    })
  }, [ident])

  return data
}

export type SearchType = [Option[], Dispatch<SetStateAction<string>>, boolean]

export const usePersonSearch = () => useSearch(searchResourceByName)
export const useSlackChannelSearch = () => useSearch(searchSlackChannel)
