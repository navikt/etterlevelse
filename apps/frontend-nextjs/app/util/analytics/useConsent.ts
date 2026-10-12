'use client'

import { useSyncExternalStore } from 'react'
import {
  CONSENT_EVENT_NAME,
  type TConsentValue,
  getConsentPreference,
  saveConsentPreference,
} from './umami'

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
