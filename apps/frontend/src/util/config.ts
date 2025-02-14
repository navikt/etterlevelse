import { user } from '../services/User'
import { env } from './env'

export const navSlackTeamId = 'T5LNAMWNA'
export const etterlevelseSlackChannelId = 'C01V697SSR2'

export const slackLink = (channelId: string) =>
  `slack://channel?team=${navSlackTeamId}&id=${channelId}`
export const slackUserLink = (userId: string) => `slack://user?team=${navSlackTeamId}&id=${userId}`
export const datajegerSlackLink = slackLink(etterlevelseSlackChannelId)
export const githubRepo = 'https://github.com/navikt/etterlevelse'
export const documentationLink = '/omstottetiletterlevelse'
export const teamInfoLink = 'https://teamkatalog.nav.no/team/264cebfa-ad46-4af9-8867-592f99f491e6'
export const markdownLink = 'https://guides.github.com/features/mastering-markdown/'
export const behandlingsKatalogLink = 'https://behandlingskatalog.ansatt.nav.no/'
export const statusPageLink =
  'https://metabase.ansatt.nav.no/dashboard/116-dashboard-for-etterlevelse'
export const VeilederEtterlevelseskrav =
  'https://navno.sharepoint.com/:w:/s/SttteforetterlevelseDIR/ERm9VrgVX4REo-ksMNyrlEUBK9RROHbqPhJXPq_h5wxgPA?e=kLeUO5'
export const omEtterlevelsePaNavet =
  'https://navno.sharepoint.com/sites/intranett-utvikling/SitePages/Etterlevelseskrav.aspx'

export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
export const personImageLink = (navIdent: string) => `/api/team/resource/${navIdent}/photo`
export const teamKatTeamLink = (id: string) => `${env.teamKatBaseUrl}team/${id}`
export const behandlingLink = (id: string) => `${env.pollyBaseUrl}process/${id}`
export const termUrl = (termId: string) =>
  `https://navno.sharepoint.com/sites/begreper/SitePages/Begrep.aspx?bid=${termId}`

export const isDev: boolean =
  window.location.origin.includes('.dev.') || window.location.origin.includes('localhost')

export const isInLimitedAccess: boolean = ['H103464', 'R154124', 'G155120'].includes(
  user.getIdent()
)
