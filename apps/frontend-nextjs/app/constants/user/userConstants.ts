import { EGroup } from '@/services/user/user'

export interface IUserInfo {
  loggedIn: boolean
  groups: EGroup[]
  ident?: string
  name?: string
  email?: string
}
