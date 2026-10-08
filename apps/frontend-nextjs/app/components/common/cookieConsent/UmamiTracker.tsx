'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { FunctionComponent, useEffect } from 'react'
import { hasAnalyticsConsent, trackUmamiPageView } from '@/util/analytics/umami'
import { env } from '@/util/env/env'

const UmamiTracker: FunctionComponent = () => {
  const pathname = usePathname()
  const consentGranted = typeof window !== 'undefined' && hasAnalyticsConsent()

  useEffect(() => {
    if (consentGranted) {
      trackUmamiPageView()
    }
  }, [consentGranted, pathname])

  if (!consentGranted || !env.umamiScriptUrl || !env.umamiWebsiteId) {
    return null
  }

  return (
    <Script
      src={env.umamiScriptUrl}
      data-website-id={env.umamiWebsiteId}
      strategy='afterInteractive'
    />
  )
}

export default UmamiTracker
