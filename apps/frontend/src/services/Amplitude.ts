import * as amplitude from '@amplitude/analytics-browser'
import { env } from '../util/env'
import { user } from './User'

const AmplitudeConfig = {
  apiEndpoint: env.amplitudeEndpoint,
  saveEvents: false,
  includeUtm: true,
  includeReferrer: true,
  trackingOptions: {
    ipAddress: false,
  },
  platform: window.location.toString(),
}

export const instance = amplitude
instance.init(env.amplitudeApiKey!, undefined, AmplitudeConfig)
instance.setUserId(undefined)
export const ampli = instance

export const userRoleEventProp = {
  role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER',
}
