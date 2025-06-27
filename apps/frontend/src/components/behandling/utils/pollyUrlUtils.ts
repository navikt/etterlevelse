import { isDev } from '../../../util/config'
import { env } from '../../../util/env'

export const getPollyBaseUrl = () => {
  return `${env.pollyBaseUrl}${isDev ? '.dev' : ''}.nav.no/`
}
