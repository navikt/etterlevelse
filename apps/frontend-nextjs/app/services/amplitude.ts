import { env } from '@/util/env/env'
import amplitude from 'amplitude-js'
import { user } from './user/userService'

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
  role: user.isAdmin()
    ? 'ADMIN'
    : user.isKraveier()
      ? 'KRAVEIER'
      : user.isPersonvernombud()
        ? 'PERSONVERNOMBUD'
        : 'ETTERLEVER',
}
