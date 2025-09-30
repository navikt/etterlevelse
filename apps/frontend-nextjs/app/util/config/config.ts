import { env } from '../env/env'

export const navSlackTeamId = 'T5LNAMWNA'

export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
export const slackLink = (channelId: string) =>
  `slack://channel?team=${navSlackTeamId}&id=${channelId}`
export const slackUserLink = (userId: string) => `slack://user?team=${navSlackTeamId}&id=${userId}`
export const termUrl = (termId: string) =>
  `https://navno.sharepoint.com/sites/begreper/SitePages/Begrep.aspx?bid=${termId}`

export const isDev: boolean =
  window.location.origin.includes('.dev.') || window.location.origin.includes('localhost')
