'use client'

import { useSyncExternalStore } from 'react'
import { type TConsentValue, getConsentPreference, saveConsentPreference } from './umami'

export const CONSENT_EVENT_NAME = 'etterlevelse-consent-changed'

const subscribe = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  window.addEventListener(CONSENT_EVENT_NAME, listener)

  return () => {
    window.removeEventListener(CONSENT_EVENT_NAME, listener)
  }
}

const getSnapshot = () => getConsentPreference() ?? ''

export const useConsent = () => {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => '')

  const updateConsent = (value: TConsentValue) => {
    saveConsentPreference(value)
  }

  return {
    consent,
    setConsent: updateConsent,
  }
}
