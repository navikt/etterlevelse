import { EGroup } from '@/services/user/userService'

export interface IUserInfo {
  loggedIn: boolean
  groups: EGroup[]
  ident?: string
  name?: string
  email?: string
}
