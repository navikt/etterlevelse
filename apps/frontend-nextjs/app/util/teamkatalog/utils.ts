import { env } from "../env/env"

export const personImageLink = (navIdent: string) => `/api/team/resource/${navIdent}/photo`
export const teamKatPersonLink = (navIdent: string) => `${env.teamKatBaseUrl}resource/${navIdent}`
