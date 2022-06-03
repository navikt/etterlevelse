import { env } from './env'

export const navSlackTeamId = 'T5LNAMWNA'
export const etterlevelseSlackChannelId = 'C01V697SSR2'

export const slackLink = (channelId: string) => `slack://channel?team=${navSlackTeamId}&id=${channelId}`
export const slackUserLink = (userId: string) => `slack://user?team=${navSlackTeamId}&id=${userId}`
export const datajegerSlackLink = slackLink(etterlevelseSlackChannelId)
export const githubRepo = 'https://github.com/navikt/etterlevelse'
export const documentationLink = 'https://navikt.github.io/naka/etterlevelse'
export const markdownLink = 'https://guides.github.com/features/mastering-markdown/'

export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
export const personImageLink = (navIdent: string) => `/api/team/resource/${navIdent}/photo`
export const teamKatTeamLink = (id: string) => `${env.teamKatBaseUrl}team/${id}`
export const behandlingLink = (id: string) => `${env.pollyBaseUrl}process/${id}`
export const termUrl = (termId: string) => `https://begrepskatalog.intern.nav.no/begrep/${termId}`

export const navStartDate = '2006-07-01'
export const maxDate = '9999-12-31'
