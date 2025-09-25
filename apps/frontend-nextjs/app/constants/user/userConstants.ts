import { EGroup } from '@/provider/user/userProvider'

export interface IUserInfo {
  loggedIn: boolean
  groups: EGroup[]
  ident?: string
  name?: string
  email?: string
}
