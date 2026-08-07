import { IPageResponse } from '@/constants/commonConstants'
import { ISlackChannel, ISlackUser } from '@/constants/teamkatalogen/slack/slackConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

const slack: string = '/team/slack'
const slackChannel: string = `${slack}/channel`
const slackUser: string = `${slack}/user`

export const getSlackChannelById = async (id: string) => {
  return (await axios.get<ISlackChannel>(`${env.backendBaseUrl}${slackChannel}/${id}`)).data
}

export const getSlackUserByEmail = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}${slackUser}/email/${id}`)).data
}

export const getSlackUserById = async (id: string) => {
  return (await axios.get<ISlackUser>(`${env.backendBaseUrl}${slackUser}/id/${id}`)).data
}

export const searchSlackChannel = async (name: string) => {
  return (
    await axios.get<IPageResponse<ISlackChannel>>(
      `${env.backendBaseUrl}${slackChannel}/search/${name}`
    )
  ).data.content
}

export const useSlackChannelSearch = async (searchParam: string) => {
  if (searchParam && searchParam.replace(/ /g, '').length > 2) {
    const searchResult = await searchSlackChannel(searchParam)
    return searchResult.map((slackChannel: ISlackChannel) => {
      return { value: slackChannel.id, label: slackChannel.name, ...slackChannel }
    })
  }
  return []
}
