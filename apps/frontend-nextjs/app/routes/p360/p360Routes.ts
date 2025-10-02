import { env } from '@/util/env/env'

export const p360Url = (recno: number) => {
  return `https://nav${env.isDev ? '-test' : ''}.${env.p360BaseUrl}locator/DMS/Case/Details/Simplified/2?module=Case&subtype=2&recno=${recno}`
}
