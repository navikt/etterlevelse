import {env} from './env'

export const navSlackTeamId = 'T5LNAMWNA'
export const datajegerSlackChannelId = 'CG2S8D25D'

export const datajegerSlackLink = `slack://channel?team=${navSlackTeamId}&id=${datajegerSlackChannelId}`
export const githubRepo = 'https://github.com/navikt/etterlevelse'
export const documentationLink = 'https://dataplattform.gitbook.io/nada/kataloger/etterlevelse'
export const markdownLink = 'https://guides.github.com/features/mastering-markdown/'

export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
export const teamKatTeamLink = (id: string) => `${env.teamKatBaseUrl}team/${id}`
export const behandlingLink = (id: string) => `${env.pollyBaseUrl}process/${id}`
export const navStartDate = '2006-07-01'
export const maxDate = '9999-12-31'
