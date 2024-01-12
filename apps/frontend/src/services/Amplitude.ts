import amplitude from 'amplitude-js'
import { env } from '../util/env'
import { user } from './User'

const AmplitudeConfig = {
  apiEndpoint: env.amplitudeEndpoint,
  saveEvents: false,
  includeUtm: true,
  includeReferrer: true,
  trackingOptions: {
    city: false,
    ip_address: false,
  },
  platform: window.location.toString(),
}

export const instance = amplitude.getInstance()
instance.init(env.amplitudeApiKey, undefined, AmplitudeConfig)
instance.setUserId(null)
export const ampli = instance

export const userRoleEventProp = {
  role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER',
}
