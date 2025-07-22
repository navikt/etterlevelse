import { env } from '@/util/env/env'
import axios from 'axios'

export const logApi = (
  level: 'info' | 'warn' | 'error',
  context: string,
  content: string
): void => {
  axios
    .post(`${env.backendBaseUrl}/frontendlog`, { level, context, content })
    .catch((error) => console.error('error writing log', error))
}
