import { env } from '@/components/others/utils/env/env'
import { user } from '@/services/user/user'
import amplitude from 'amplitude-js'

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
