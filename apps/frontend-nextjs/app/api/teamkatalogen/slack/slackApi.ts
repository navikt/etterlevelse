import { IPageResponse } from '@/constants/commonConstants'
import { ISlackChannel, ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getSlackUserByEmail = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}/team/slack/user/email/${id}`)).data
}

export const searchSlackChannel = async (name: string): Promise<ISlackChannel[]> => {
  return (
    await axios.get<IPageResponse<ISlackChannel>>(
      `${env.backendBaseUrl}/team/slack/channel/search/${name}`
    )
  ).data.content
}

export const getSlackChannelById = async (id: string): Promise<ISlackChannel> => {
  return (await axios.get<ISlackChannel>(`${env.backendBaseUrl}/team/slack/channel/${id}`)).data
}

export const getSlackUserById = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}/team/slack/user/id/${id}`)).data
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
