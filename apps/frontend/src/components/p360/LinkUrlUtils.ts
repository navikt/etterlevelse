import { isDev } from '../../util/config'
import { env } from '../../util/env'

export const p360Url = (recno: number) => {
  return `https://nav${isDev ? '-test' : ''}.${env.p360BaseUrl}locator/DMS/Case/Details/Simplified/2?module=Case&subtype=2&recno=${recno}`
}
