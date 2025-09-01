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

export const isInLimitedAccess = (ident: string) =>
  [
    'H103464',
    'R154124',
    'J142849',
    'T139680',
    'A132855',
    'E171300',
    'G103103',
    'B156859',
    'R107763',
    'B100673',
    'E157419',
    'S128848',
    'H162137',
    'S162123',
    'G167358',
    'D128493',
    'B101577',
    'V152286',
    'H151343',
    'E149421',
    'A155562',
    'S139733',
    'S162301',
    'T161787',
    'N138254',
    'M165705',
    'R166758',
    'B101557',
    'S171514',
    'S168290',
    'S165571',
    'L142928',
    'K164523',
    'T154537',
    'S163101',
    'R107838',
    'L105671',
    'S108888',
    'B144242',
    'G154306',
    'K175342',
    'P107352',
    'B115620',
    'D152009',
    'E138438',
    'E158860',
    'E171917',
    'H138453',
    'H162909',
    'I161157',
    'J161817',
    'K104859',
    'K124134',
    'K134177',
    'M106481',
    'N136220',
    'N153960',
    'P150569',
    'P173452',
    'R148193',
    'S160443',
    'T149391',
    'V168170',
    'B171696',
    'E102227',
    'G137876',
    'G164123',
    'S142779',
    'S158862',
    'T164319',
    'H149146',
    'S164151',
    'S169569',
    'U139390',
    'K113774',
    'W162163',
    'B170002',
    'B101002',
    'B101002',
    'L139301',
    'T139822',
    'H122532',
    'H125562',
    'O142054',
    'P141911',
    'N172260',
    'A112940',
    'S137494',
    'K175911',
    'K105026',
    'N106710',
    'A128380',
    'H141598',
    'N106557',
    'T162195',
    'H153333',
    'R136472',
    'B101213',
    'N127943',
    'H166163',
    'A145518',
    'N149714',
    'K159339',
    'B168653',
    'E169400',
  ].includes(ident)
