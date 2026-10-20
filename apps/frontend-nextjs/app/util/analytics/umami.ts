export type TConsentValue = 'accepted' | 'rejected'

const CONSENT_COOKIE_NAME = 'etterlevelse-cookie-consent'
export const CONSENT_EVENT_NAME = 'etterlevelse-consent-changed'

export const UMAMI_EVENTS = {
  PAGEVIEW: 'pageview',
  CHECKBOX_TOGGLED: 'checkbox_toggled',
  MODAL_OPENED: 'modal_opened',
  BUTTON_CLICKED: 'button_clicked',
  ACTION_SELECTED: 'action_selected',
  TAB_SELECTED: 'tab_selected',
  FILTER_CHANGED: 'filter_changed',
} as const

export type TUmamiEventName = (typeof UMAMI_EVENTS)[keyof typeof UMAMI_EVENTS]

type TUmamiBaseEventData = {
  page?: string
  component?: string
  field?: string
  action?: string
  status?: string
  id?: string | number
  context?: string
  variant?: string
}

type TUmamiEventDataMap = {
  [UMAMI_EVENTS.PAGEVIEW]: TUmamiBaseEventData
  [UMAMI_EVENTS.CHECKBOX_TOGGLED]: TUmamiBaseEventData & {
    checked: boolean
  }
  [UMAMI_EVENTS.MODAL_OPENED]: TUmamiBaseEventData & {
    modal: string
    openedFrom?: string
  }
  [UMAMI_EVENTS.BUTTON_CLICKED]: TUmamiBaseEventData & {
    button: string
    label?: string
  }
  [UMAMI_EVENTS.ACTION_SELECTED]: TUmamiBaseEventData & {
    action: string
    value?: string
  }
  [UMAMI_EVENTS.TAB_SELECTED]: TUmamiBaseEventData & {
    group?: string
    tab: string
    tab_label?: string
    avdeling_id?: string
  }
  [UMAMI_EVENTS.FILTER_CHANGED]: TUmamiBaseEventData & {
    filter: string
    value?: string
    value_length?: number
  }
}

type TUmamiTrackData = {
  [key: string]: string | number | boolean | undefined
}

type TUmamiApi = {
  track?: (eventName: string, data?: TUmamiTrackData) => void
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
    trackUmamiEvent(UMAMI_EVENTS.PAGEVIEW)
  }
}

export const trackUmamiEvent = <TEventName extends TUmamiEventName>(
  eventName: TEventName,
  data?: TUmamiEventDataMap[TEventName],
): void => {
  if (!hasAnalyticsConsent() || typeof window === 'undefined') {
    return
  }

  const umami = getUmami()
  if (!umami || typeof umami.track !== 'function') {
    return
  }

  const payload = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== undefined),
  ) as TUmamiTrackData

  umami.track(eventName, Object.keys(payload).length > 0 ? payload : undefined)
}
