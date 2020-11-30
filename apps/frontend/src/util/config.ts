import {env} from './env'

export const navSlackTeamId = 'T5LNAMWNA'
export const datajegerSlackChannelId = 'CG2S8D25D'

export const datajegerSlackLink = `slack://channel?team=${navSlackTeamId}&id=${datajegerSlackChannelId}`
export const githubRepo = 'https://github.com/navikt/etterlevelse'
export const documentationLink = 'https://dataplattform.gitbook.io/nada/kataloger/etterlevelse'
export const markdownLink = 'https://guides.github.com/features/mastering-markdown/'

export const teamKatPersonLink = (teamId: string) => `${env.teamKatBaseUrl}resource/${teamId}`
