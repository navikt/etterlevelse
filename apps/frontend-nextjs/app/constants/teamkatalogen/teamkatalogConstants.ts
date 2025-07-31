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