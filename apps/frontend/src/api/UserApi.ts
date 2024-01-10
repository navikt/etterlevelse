import axios from 'axios'
import { IUserInfo } from '../constants'
import { env } from '../util/env'

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

export const getUserInfo = async () => axios.get<IUserInfo>(`${env.backendBaseUrl}/userinfo`)
