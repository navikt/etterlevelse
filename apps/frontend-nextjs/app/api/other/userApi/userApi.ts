import { env } from '@/components/others/utils/env/env'
import { IUserInfo } from '@/constants/user/constants'
import axios from 'axios'

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

export const getUserInfo = async () => axios.get<IUserInfo>(`${env.backendBaseUrl}/userinfo`)
