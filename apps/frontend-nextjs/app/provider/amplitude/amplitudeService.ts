// 'use client'

// import { user } from '@/services/user/userService'
// import { env } from '@/util/env/env'

// export const ampli = () => {
//   if (typeof window === 'undefined') return null

//   // eslint-disable-next-line @typescript-eslint/no-require-imports
//   const amplitude = require('amplitude-js')
//   const ampliInstance = amplitude.getInstance()

//   const AmplitudeConfig = {
//     apiEndpoint: env.amplitudeEndpoint,
//     saveEvents: false,
//     includeUtm: true,
//     includeReferrer: true,
//     trackingOptions: {
//       city: false,
//       ip_address: false,
//     },
//     platform: window.location.href,
//   }

//   ampliInstance.init(env.amplitudeApiKey, undefined, AmplitudeConfig)
//   ampliInstance.setUserId(null)

//   return ampliInstance
// }

// export const userRoleEventProp = {
//   role: user.isAdmin()
//     ? 'ADMIN'
//     : user.isKraveier()
//       ? 'KRAVEIER'
//       : user.isPersonvernombud()
//         ? 'PERSONVERNOMBUD'
//         : 'ETTERLEVER',
// }
