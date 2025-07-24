import { IPageResponse } from '@/constants/commonConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { env } from '@/util/env/env'
import { useForceUpdate } from '@/util/hooks/customHooks/customHooks'
import axios from 'axios'

const people: Map<string, { f: boolean; v: string }> = new Map<string, { f: boolean; v: string }>()
const psubs: Map<string, (() => void)[]> = new Map<string, (() => void)[]>()

const pSubscribe = (id: string, done: () => void): void => {
  if (!people.has(id)) {
    people.set(id, { f: false, v: id })
  }
  if (psubs.has(id)) {
    psubs.set(id, [...psubs.get(id)!, done])
  } else {
    psubs.set(id, [done])
  }
}

export const searchResourceByName = async (resourceName: string): Promise<ITeamResource[]> => {
  return (
    await axios.get<IPageResponse<ITeamResource>>(
      `${env.backendBaseUrl}/team/resource/search/${resourceName}`
    )
  ).data.content
}

export const getResourceById = async (resourceId: string): Promise<ITeamResource> => {
  return (await axios.get<ITeamResource>(`${env.backendBaseUrl}/team/resource/${resourceId}`)).data
}

const addPerson = (person: ITeamResource): void => {
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

export const usePersonSearch = async (
  searchParam: string
): Promise<
  {
    navIdent: string
    givenName: string
    familyName: string
    fullName: string
    email: string
    resourceType: string
    value: string
    label: string
  }[]
> => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult: ITeamResource[] = await searchResourceByName(searchParam)
    return searchResult.map((person: ITeamResource) => {
      return { value: person.navIdent, label: person.fullName, ...person }
    })
  }
  return []
}
