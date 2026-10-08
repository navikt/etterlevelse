export type TConsentValue = 'accepted' | 'rejected'

const CONSENT_COOKIE_NAME = 'etterlevelse-cookie-consent'
export const CONSENT_EVENT_NAME = 'etterlevelse-consent-changed'

type TUmamiApi = {
  track?: (eventName: string, data?: Record<string, string | number | boolean>) => void
  trackView?: () => void
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

const getUmami = (): TUmamiApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return (window as typeof window & { umami?: TUmamiApi }).umami
}

export const trackUmamiPageView = (): void => {
  if (!hasAnalyticsConsent() || typeof window === 'undefined') {
    return
  }

  const umami = getUmami()
  if (!umami) {
    return
  }

  if (typeof umami.trackView === 'function') {
    umami.trackView()
    return
  }

  if (typeof umami.track === 'function') {
    trackUmamiEvent('pageview')
  }
}

export const trackUmamiEvent = (
  eventName: string,
  data?: Record<string, string | number | boolean>
): void => {
  if (!hasAnalyticsConsent() || typeof window === 'undefined') {
    return
  }

  const umami = getUmami()
  if (!umami || typeof umami.track !== 'function') {
    return
  }

  umami.track(eventName, data)
}
