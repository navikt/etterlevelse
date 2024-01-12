import axios from 'axios'
import { env } from '../util/env'

export const writeLog = (level: 'info' | 'warn' | 'error', context: string, content: string) => {
  axios
    .post(`${env.backendBaseUrl}/frontendlog`, { level, context, content })
    .catch((e) => console.error('error writing log', e))
}
