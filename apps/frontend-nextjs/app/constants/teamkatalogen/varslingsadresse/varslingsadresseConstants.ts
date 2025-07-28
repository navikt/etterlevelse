import { ISlackChannel, ISlackUser } from '../slack/slackConstants'

export enum EAdresseType {
  EPOST = 'EPOST',
  SLACK = 'SLACK',
  SLACK_USER = 'SLACK_USER',
}
export type TVarslingsadresseQL = IVarslingsadresse & {
  slackChannel?: ISlackChannel
  slackUser?: ISlackUser
}

export interface IVarslingsadresse {
  adresse: string
  type: EAdresseType
}
