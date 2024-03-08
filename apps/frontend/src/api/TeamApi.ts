import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  IPageResponse,
  IProductArea,
  ISlackChannel,
  ISlackUser,
  ITeam,
  ITeamResource,
} from '../constants'
import { user } from '../services/User'
import { env } from '../util/env'
import { useForceUpdate } from '../util/hooks/customHooks'

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<ITeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

export const searchResourceByName = async (resourceName: string) => {
  return (
    await axios.get<IPageResponse<ITeamResource>>(
      `${env.backendBaseUrl}/team/resource/search/${resourceName}`
    )
  ).data.content
}

export const getTeam = async (teamId: string) => {
  const data = (await axios.get<ITeam>(`${env.backendBaseUrl}/team/${teamId}`)).data
  data.members = data.members.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return data
}

export const getAllTeams = async () => {
  return (await axios.get<IPageResponse<ITeam>>(`${env.backendBaseUrl}/team`)).data.content
}

export const myTeams = async () => {
  return (await axios.get<IPageResponse<ITeam>>(`${env.backendBaseUrl}/team?myTeams=true`)).data
    .content
}

export const myProductArea = async () => {
  return (
    await axios.get<IPageResponse<IProductArea>>(
      `${env.backendBaseUrl}/team/productarea?myProductAreas=true`
    )
  ).data.content
}

export const searchTeam = async (teamSearch: string) => {
  return (await axios.get<IPageResponse<ITeam>>(`${env.backendBaseUrl}/team/search/${teamSearch}`))
    .data.content
}

export const getSlackChannelById = async (id: string) => {
  return (await axios.get<ISlackChannel>(`${env.backendBaseUrl}/team/slack/channel/${id}`)).data
}

export const getSlackUserByEmail = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}/team/slack/user/email/${id}`)).data
}

export const getSlackUserById = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}/team/slack/user/id/${id}`)).data
}

export const searchSlackChannel = async (name: string) => {
  return (
    await axios.get<IPageResponse<ISlackChannel>>(
      `${env.backendBaseUrl}/team/slack/channel/search/${name}`
    )
  ).data.content
}

// Overly complicated async fetch of people and teams

const people: Map<string, { f: boolean; v: string }> = new Map<string, { f: boolean; v: string }>()
const teams: Map<string, { f: boolean; v: ITeam }> = new Map<string, { f: boolean; v: ITeam }>()
const psubs: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()
const tsubs: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()

const addPerson = (person: ITeamResource) => {
  people.set(person.navIdent, { f: true, v: person.fullName })
  psubs.get(person.navIdent)?.forEach((f) => f())
  psubs.delete(person.navIdent)
}
const addTeam = (team: ITeam) => {
  teams.set(team.id, { f: true, v: team })
  tsubs.get(team.id)?.forEach((f) => f())
  tsubs.delete(team.id)
}

const pSubscribe = (id: string, done: () => void) => {
  !people.has(id) && people.set(id, { f: false, v: id })
  psubs.has(id) ? psubs.set(id, [...psubs.get(id)!, done]) : psubs.set(id, [done])
}
const tSubscribe = (id: string, done: () => void) => {
  !teams.has(id) &&
    teams.set(id, { f: false, v: { id, name: id, description: '', members: [], tags: [] } })
  tsubs.has(id) ? tsubs.set(id, [...tsubs.get(id)!, done]) : tsubs.set(id, [done])
}

export const usePersonName = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!people.get(id)?.f) {
      if (!people.has(id))
        getResourceById(id)
          .then((person) => addPerson(person))
          .catch((error) => console.error('err fetching person', error))
      pSubscribe(id, update)
    }
    return people.get(id)?.v || id
  }
}

export const useSearchTeamOptions = async (searchParam: string) => {
  if (searchParam && searchParam.length > 2) {
    const teams = await searchTeam(searchParam)
    if (teams && teams.length) {
      return teams.map((team) => {
        return { value: team.id, label: team.name, ...team }
      })
    }
  }
  return []
}

export const useTeam = () => {
  const update = useForceUpdate()
  return (id: string) => {
    if (!teams.get(id)?.f) {
      if (!teams.has(id))
        getTeam(id)
          .then((t) => addTeam(t))
          .catch((e) => console.error('err fetching team', e))
      tSubscribe(id, update)
    }
    const team = teams.get(id)?.v
    return [team?.name || id, team] as [string, ITeam | undefined]
  }
}

export const useMyTeams = () => {
  const [productAreas] = useMyProductAreas()
  const [data, setData] = useState<ITeam[]>([])
  const [loading, setLoading] = useState(true)

  const ident = user.getIdent()

  useEffect(() => {
    ident &&
      myTeams()
        .then((teamListe) => {
          if (teamListe.length === 0) {
            getAllTeams().then((response) => {
              const teamList = productAreas
                .map((productArea) =>
                  response.filter((team) => productArea.id === team.productAreaId)
                )
                .flat()
              const uniqueValuesSet = new Set()

              const uniqueFilteredTeamList = teamList.filter((team) => {
                const isPresentInSet = uniqueValuesSet.has(team.name)
                uniqueValuesSet.add(team.name)
                return !isPresentInSet
              })
              setData(uniqueFilteredTeamList)
            })
          } else {
            setData(teamListe)
          }
          setLoading(false)
        })
        .catch((error) => {
          setData([])
          setLoading(false)
          console.error("couldn't find teams", error)
        })
    !ident && setLoading(false)
  }, [ident, productAreas])

  return [data, loading] as [ITeam[], boolean]
}

export const useMyProductAreas = () => {
  const [data, setData] = useState<IProductArea[]>([])
  const [loading, setLoading] = useState(true)
  const ident = user.getIdent()

  useEffect(() => {
    ident &&
      myProductArea()
        .then((r) => {
          setData(r)
          setLoading(false)
        })
        .catch((e) => {
          setData([])
          setLoading(false)
          console.error('couldn\t find product area', e)
        })
    !ident && setLoading(false)
  }, [ident])

  return [data, loading] as [IProductArea[], boolean]
}

export const usePersonSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchResourceByName(searchParam)
    return searchResult.map((person) => {
      return { value: person.navIdent, label: person.fullName, ...person }
    })
  }
  return []
}

export const useSlackChannelSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchSlackChannel(searchParam)
    return searchResult.map((slackChannel) => {
      return { value: slackChannel.id, label: slackChannel.name, ...slackChannel }
    })
  }
  return []
}
