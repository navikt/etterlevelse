export interface IMember {
  navIdent?: string
  name?: string
  email?: string
}

export interface ITeam {
  id: string
  name: string
  description: string
  productAreaId?: string
  productAreaName?: string
  slackChannel?: string
  tags: string[]
  members: IMember[]
}

export interface ITeamResource {
  navIdent: string
  givenName: string
  familyName: string
  fullName: string
  email: string
  resourceType: string
}

export interface IProductArea {
  id: string
  name: string
  description: string
  tags: string[]
  members: IMember[]
}

export interface ITemaCodeData {
  image?: string
  shortDesciption?: string
}

export interface IOrgEnhet {
  id: string
  navn: string
  orgEnhetsType: EOrgEnhetsType
  nomNivaa: ENomNivaa
}

export enum EOrgEnhetsType {
  ARBEIDSLIVSSENTER = 'ARBEIDSLIVSSENTER',
  NAV_ARBEID_OG_YTELSER = 'NAV_ARBEID_OG_YTELSER',
  ARBEIDSRAADGIVNING = 'ARBEIDSRAADGIVNING',
  DIREKTORAT = 'DIREKTORAT',
  DIR = 'DIR',
  FYLKE = 'FYLKE',
  NAV_FAMILIE_OG_PENSJONSYTELSER = 'NAV_FAMILIE_OG_PENSJONSYTELSER',
  HJELPEMIDLER_OG_TILRETTELEGGING = 'HJELPEMIDLER_OG_TILRETTELEGGING',
  KLAGEINSTANS = 'KLAGEINSTANS',
  NAV_KONTAKTSENTER = 'NAV_KONTAKTSENTER',
  KONTROLL_KONTROLLENHET = 'KONTROLL_KONTROLLENHET',
  NAV_KONTOR = 'NAV_KONTOR',
  TILTAK = 'TILTAK',
  NAV_OKONOMITJENESTE = 'NAV_OKONOMITJENESTE',
}

export enum ENomNivaa {
  LINJEENHET = 'LINJEENHET',
  DRIFTSENHET = 'DRIFTSENHET',
  ARBEIDSOMRAADE = 'ARBEIDSOMRAADE',
}
