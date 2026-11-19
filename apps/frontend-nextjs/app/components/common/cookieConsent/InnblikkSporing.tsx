'use client'

import Script from 'next/script'
import { FunctionComponent, useLayoutEffect } from 'react'
import { hasAnalyticsConsent } from '@/util/analytics/innblikk'
import { useConsent } from '@/util/analytics/useConsent'
import { env } from '@/util/env/env'

type TInnblikkWindow = typeof window & {
  innblikkBeforeSend?: (eventType: string, payload: unknown) => unknown
}

const InnblikkSporing: FunctionComponent = () => {
  const { consent } = useConsent()

  useLayoutEffect(() => {
    ;(window as TInnblikkWindow).innblikkBeforeSend = (_eventType, payload) =>
      hasAnalyticsConsent() ? payload : undefined
  }, [])

  if (consent !== 'accepted' || !env.innblikkScriptUrl || !env.innblikkWebsiteId) {
    return null
  }

  return (
    <Script
      defer
      src={env.innblikkScriptUrl}
      data-website-id={env.innblikkWebsiteId}
      data-before-send='innblikkBeforeSend'
      strategy='afterInteractive'
    />
  )
}

export default InnblikkSporing
