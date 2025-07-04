const navSlackTeamId: string = 'T5LNAMWNA'
const etterlevelseSlackChannelId: string = 'C01V697SSR2'

const slackLink = (channelId: string): string =>
  `slack://channel?team=${navSlackTeamId}&id=${channelId}`

export const statusPageLink: string =
  'https://metabase.ansatt.nav.no/dashboard/116-dashboard-for-etterlevelse'
export const omEtterlevelsePaNavet: string =
  'https://navno.sharepoint.com/sites/intranett-utvikling/SitePages/Etterlevelseskrav.aspx'
export const behandlingsKatalogLink: string = 'https://behandlingskatalog.ansatt.nav.no/'
export const veilederEtterlevelseskrav: string =
  'https://navno.sharepoint.com/:w:/s/SttteforetterlevelseDIR/ERm9VrgVX4REo-ksMNyrlEUBK9RROHbqPhJXPq_h5wxgPA?e=kLeUO5'
export const rutineForArkivering: string =
  'https://navno.sharepoint.com/sites/intranett-arkiv-og-dokumenthandtering/SitePages/Rutine-for-arkivering-av-Etterlevelse.aspx?csf=1&web=1&e=Yj4x9i&CID=ab5f84d4-b45c-4f49-9234-86bcfa8d07e4'
export const dokumentasjonLink: string = '/omstottetiletterlevelse'
export const githubRepo: string = 'https://github.com/navikt/etterlevelse'
export const teamInfoLink: string =
  'https://teamkatalog.nav.no/team/264cebfa-ad46-4af9-8867-592f99f491e6'

export const datajegerSlackLink: string = slackLink(etterlevelseSlackChannelId)
