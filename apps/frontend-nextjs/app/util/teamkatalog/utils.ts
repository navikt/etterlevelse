import { env } from "../env/env"
import { ISlackChannel } from '@/constants/teamkatalogen/slack/slackConstants'
import * as yup from 'yup'

export const personImageLink = (navIdent: string) => `/api/team/resource/${navIdent}/photo`
export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`

export const emailValidator = yup
  .string()
  .email()
  .matches(/.+@nav.no/i)

export const slackChannelView = (channel: ISlackChannel, long?: boolean): string =>
  `Slack: #${channel.name} ${long ? channel.numMembers : ''}`
