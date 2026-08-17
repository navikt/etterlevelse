const navSlackTeamId: string = 'T5LNAMWNA'
const etterlevelseSlackChannelId: string = 'C01V697SSR2'

const slackLink = (channelId: string): string =>
  `slack://channel?team=${navSlackTeamId}&id=${channelId}`

export const omEtterlevelsePaNavet: string =
  'https://navno.sharepoint.com/sites/intranett-utvikling/SitePages/Etterlevelseskrav.aspx'
export const behandlingsKatalogLink: string = 'https://behandlingskatalog.ansatt.nav.no/'
export const veilederEtterlevelseskrav: string =
  'https://navno.sharepoint.com/:w:/s/SttteforetterlevelseDIR/ERm9VrgVX4REo-ksMNyrlEUBK9RROHbqPhJXPq_h5wxgPA?e=kLeUO5'
export const dokumentasjonLink: string = '/omstottetiletterlevelse'
export const githubRepo: string = 'https://github.com/navikt/etterlevelse'
export const teamInfoLink: string =
  'https://teamkatalog.nav.no/team/264cebfa-ad46-4af9-8867-592f99f491e6'
export const markdownLink: string = 'https://guides.github.com/features/mastering-markdown/'

export const datajegerSlackLink: string = slackLink(etterlevelseSlackChannelId)
