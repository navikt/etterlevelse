'use client'

import { Button, Modal } from '@navikt/ds-react'
import { FormikProps } from 'formik'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'

type TProps = {
  isDirty?: boolean
  navigateUrl: string
  formRef?: RefObject<FormikProps<any> | null>
}

const UNSAVED_GUARD_BYPASS_EVENT = 'unsavedChangesGuard:bypass'

// Call right before an intentional reload/navigation so the guard skips its unsaved prompt.
export const bypassUnsavedGuard = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UNSAVED_GUARD_BYPASS_EVENT))
  }
}

export const UnsavedChangesGuard: FunctionComponent<TProps> = ({
  isDirty,
  navigateUrl,
  formRef,
}) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isOpenRef = useRef<boolean>(false)
  const isDirtyRef = useRef<boolean>(!!isDirty)
  const dirtyLatchRef = useRef<boolean>(false)
  const dirtySentinelPushedRef = useRef<boolean>(false)
  const formBagRef = useRef<FormikProps<any> | null>(null)
  const missCountRef = useRef<number>(0)
  const isLeavingRef = useRef<boolean>(false)
  const navigateUrlRef = useRef<string>(navigateUrl)

  // A browser-back press can unmount/reset the active form before the popstate handler reads it,
  // so latch the last-seen dirty state and fall back to it when the live Formik bag is gone.
  const getIsDirty = (): boolean =>
    formRef ? !!formRef.current?.dirty || dirtyLatchRef.current : isDirtyRef.current

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!formRef) {
      return
    }
    const intervalId = window.setInterval(() => {
      if (formRef.current) {
        const dirtyNow = !!formRef.current.dirty
        dirtyLatchRef.current = dirtyNow
        formBagRef.current = formRef.current
        missCountRef.current = 0
        if (dirtyNow && !dirtySentinelPushedRef.current) {
          // Hold the CURRENT url so a back press stays on this view and the form stays mounted
          window.history.pushState(window.history.state, '', window.location.href)
          dirtySentinelPushedRef.current = true
        } else if (!dirtyNow) {
          dirtySentinelPushedRef.current = false
        }
      } else if (!isOpenRef.current && ++missCountRef.current >= 2) {
        // No form mounted for a moment (e.g. after an in-app save) → stop guarding.
        // Frozen while the guard is open so its save handler keeps the latched bag.
        dirtyLatchRef.current = false
        formBagRef.current = null
      }
    }, 100)
    return () => window.clearInterval(intervalId)
  }, [formRef])

  useEffect(() => {
    isDirtyRef.current = !!isDirty
  }, [isDirty])

  useEffect(() => {
    navigateUrlRef.current = navigateUrl
  }, [navigateUrl])

  useEffect(() => {
    const handleBypassRequest = (): void => {
      isLeavingRef.current = true
    }
    window.addEventListener(UNSAVED_GUARD_BYPASS_EVENT, handleBypassRequest)
    return () => window.removeEventListener(UNSAVED_GUARD_BYPASS_EVENT, handleBypassRequest)
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!getIsDirty() || isLeavingRef.current) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const leave = (): void => {
    isLeavingRef.current = true
    setIsOpen(false)
    router.push(navigateUrlRef.current)
  }

  useEffect(() => {
    // Sentinel entry so a browser-back press is caught instead of leaving the page
    window.history.pushState(window.history.state, '', window.location.href)

    let hashNavUntil = 0

    const handleHashChange = (): void => {
      // In-page anchor jumps (e.g. error-summary links) must not trip the leave guard
      hashNavUntil = Date.now() + 500
    }

    const handlePopState = (): void => {
      if (isLeavingRef.current) {
        return
      }

      // Ignore in-page fragment navigation (anchor links), which never leaves the page
      if (Date.now() < hashNavUntil || window.location.hash) {
        return
      }

      // Re-hold position so the back press never actually leaves the page unguarded
      window.history.pushState(window.history.state, '', window.location.href)

      if (getIsDirty()) {
        setIsOpen(true)
      } else {
        leave()
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <Modal
      onClose={() => setIsOpen(false)}
      open={isOpen}
      header={{
        heading: 'Vil du lagre endringene dine før du går videre?',
        closeButton: false,
      }}
    >
      <Modal.Body>
        <br />
      </Modal.Body>
      <Modal.Footer>
        <Button
          type='button'
          onClick={async () => {
            const form = formRef?.current ?? formBagRef.current
            if (!form) {
              leave()
              return
            }
            // submitForm() resolves even when validation fails, so check validity before leaving
            const errors = await form.validateForm()
            if (errors && Object.keys(errors).length > 0) {
              // validateForm() populated the form's errors → close guard so its ErrorSummary shows
              setIsOpen(false)
              return
            }
            // Suppress beforeunload before submit: some submit handlers do window.location.reload()
            isLeavingRef.current = true
            await form.submitForm()
            // Hard navigation overrides any window.location.reload() the submit handler queued
            window.location.assign(navigateUrlRef.current)
          }}
        >
          Lagre og fortsette
        </Button>
        <Button type='button' variant='secondary' onClick={() => leave()}>
          Fortsett uten å lagre
        </Button>
        <Button type='button' variant='tertiary' onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UnsavedChangesGuard
