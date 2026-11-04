import axios from 'axios'
import { registerOptimisticLockingInterceptor } from '@/api/optimisticLocking/optimisticLockingApi'
import { IUserInfo } from '@/constants/user/userConstants'
import { env } from '@/util/env/env'

// Add auth cookie to rest calls
axios.defaults.withCredentials = true

// HTTP 409 ved versjonskonflikt: vis melding og last data på nytt
registerOptimisticLockingInterceptor()

export const getUserInfo = async () => axios.get<IUserInfo>(`${env.backendBaseUrl}/userinfo`)
