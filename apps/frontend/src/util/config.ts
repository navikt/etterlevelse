import { getPollyBaseUrl } from '../components/behandling/utils/pollyUrlUtils'
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
export const rutineForArkivering =
  'https://navno.sharepoint.com/sites/intranett-arkiv-og-dokumenthandtering/SitePages/Rutine-for-arkivering-av-Etterlevelse.aspx?csf=1&web=1&e=Yj4x9i&CID=ab5f84d4-b45c-4f49-9234-86bcfa8d07e4'

export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
export const personImageLink = (navIdent: string) => `/api/team/resource/${navIdent}/photo`
export const teamKatTeamLink = (id: string) => `${env.teamKatBaseUrl}team/${id}`
export const behandlingLink = (id: string) => `${getPollyBaseUrl()}process/${id}`
export const termUrl = (termId: string) =>
  `https://navno.sharepoint.com/sites/begreper/SitePages/Begrep.aspx?bid=${termId}`

export const isDev: boolean =
  window.location.origin.includes('.dev.') || window.location.origin.includes('localhost')

export const isInLimitedAccess = (ident: string) => ['ident'].includes(ident)
