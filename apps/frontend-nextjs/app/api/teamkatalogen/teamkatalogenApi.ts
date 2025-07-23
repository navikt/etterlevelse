import { IPageResponse, ISlackChannel } from '@/constants/commonConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'
import { useForceUpdate } from '@/util/hooks/customHooks/customHooks'
import axios from 'axios'

const people: Map<string, { f: boolean; v: string }> = new Map<string, { f: boolean; v: string }>()
const psubs: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()

const pSubscribe = (id: string, done: () => void) => {
  if (!people.has(id)) {
    people.set(id, { f: false, v: id })
  }
  if (psubs.has(id)) {
    psubs.set(id, [...psubs.get(id)!, done])
  } else {
    psubs.set(id, [done])
  }
}

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<ITeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

export const searchSlackChannel = async (name: string) => {
  return (
    await axios.get<IPageResponse<ISlackChannel>>(
      `${env.backendBaseUrl}/team/slack/channel/search/${name}`
    )
  ).data.content
}

const addPerson = (person: ITeamResource) => {
  people.set(person.navIdent, { f: true, v: person.fullName })
  psubs.get(person.navIdent)?.forEach((f) => f())
  psubs.delete(person.navIdent)
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

export const useSlackChannelSearch = async (
  searchParam: string
): Promise<
  {
    id: string
    name?: string
    numMembers?: number
    value: string
    label: string | undefined
  }[]
> => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult: ISlackChannel[] = await searchSlackChannel(searchParam)
    return searchResult.map((slackChannel: ISlackChannel) => {
      return { value: slackChannel.id, label: slackChannel.name, ...slackChannel }
    })
  }
  return []
}
