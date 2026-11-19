import type { EventName, EventPropertiesMap } from '@navikt/analytics-types'

export type TConsentValue = 'accepted' | 'rejected'

const CONSENT_COOKIE_NAME = 'etterlevelse-cookie-consent'
export const CONSENT_EVENT_NAME = 'etterlevelse-consent-changed'

type TInnblikkApi = {
  track?: (eventName: string, data?: Record<string, unknown>) => void
}

const isConsentValue = (value: string | undefined): value is TConsentValue => {
  return value === 'accepted' || value === 'rejected'
}

const notifyConsentChanged = (value: TConsentValue): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT_NAME, { detail: value }))
}

export const hasAnalyticsConsent = (): boolean => getConsentPreference() === 'accepted'

export const getConsentPreference = (): TConsentValue | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split('; ')
  const consentCookie = cookies.find((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`))

  if (!consentCookie) {
    return null
  }

  const value = consentCookie.split('=')[1]
  return isConsentValue(value) ? value : null
}

export const saveConsentPreference = (value: TConsentValue): void => {
  if (typeof document === 'undefined') {
    return
  }

  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toUTCString()
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`
  notifyConsentChanged(value)
}

const getInnblikk = (): TInnblikkApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (window as typeof window & { sporing?: TInnblikkApi }).sporing
}

export const sporInnblikkHendelse = <TEventName extends EventName>(
  eventName: TEventName,
  data: EventPropertiesMap[NoInfer<TEventName>]
): void => {
  if (!hasAnalyticsConsent()) {
    return
  }

  const innblikk = getInnblikk()
  if (!innblikk || typeof innblikk.track !== 'function') {
    return
  }

  const payload = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )

  innblikk.track(eventName, Object.keys(payload).length > 0 ? payload : undefined)
}
