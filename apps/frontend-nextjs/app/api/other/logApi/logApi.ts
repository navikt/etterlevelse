import { env } from '@/components/others/utils/env/env'
import axios from 'axios'

export const logApi = (level: 'info' | 'warn' | 'error', context: string, content: string) => {
  axios
    .post(`${env.backendBaseUrl}/frontendlog`, { level, context, content })
    .catch((e) => console.error('error writing log', e))
}
