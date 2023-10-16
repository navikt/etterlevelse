import axios from 'axios'
import { UserInfo } from '../constants'
import { env } from '../util/env'

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

export const getUserInfo = async () => axios.get<UserInfo>(`${env.backendBaseUrl}/userinfo`)
