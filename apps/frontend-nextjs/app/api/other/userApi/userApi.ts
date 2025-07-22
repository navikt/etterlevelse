import { IUserInfo } from '@/constants/user/userConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

export const getUserInfo = async () => axios.get<IUserInfo>(`${env.backendBaseUrl}/userinfo`)
