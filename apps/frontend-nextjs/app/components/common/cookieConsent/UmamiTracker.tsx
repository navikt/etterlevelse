'use client'

import Script from 'next/script'
import { FunctionComponent } from 'react'
import { hasAnalyticsConsent } from '@/util/analytics/umami'
import { env } from '@/util/env/env'

const UmamiTracker: FunctionComponent = () => {
  const consentGranted = typeof window !== 'undefined' && hasAnalyticsConsent()

  if (!consentGranted || !env.umamiScriptUrl || !env.umamiWebsiteId) {
    return null
  }

  return (
    <Script
      defer
      src={env.umamiScriptUrl}
      data-website-id={env.umamiWebsiteId}
      strategy='afterInteractive'
    />
  )
}

export default UmamiTracker
