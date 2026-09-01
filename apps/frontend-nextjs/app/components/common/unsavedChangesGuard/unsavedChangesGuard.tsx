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

export const UnsavedChangesGuard: FunctionComponent<TProps> = ({
  isDirty,
  navigateUrl,
  formRef,
}) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isDirtyRef = useRef<boolean>(!!isDirty)
  const isLeavingRef = useRef<boolean>(false)
  const navigateUrlRef = useRef<string>(navigateUrl)

  // Prefer live Formik dirty via formRef (container usage doesn't re-render per keystroke)
  const getIsDirty = (): boolean => (formRef ? !!formRef.current?.dirty : isDirtyRef.current)

  useEffect(() => {
    isDirtyRef.current = !!isDirty
  }, [isDirty])

  useEffect(() => {
    navigateUrlRef.current = navigateUrl
  }, [navigateUrl])

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

    const handlePopState = (): void => {
      if (isLeavingRef.current) {
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

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
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
            const form = formRef?.current
            if (!form) {
              leave()
              return
            }
            // submitForm() resolves even when validation fails, so check validity before leaving
            const errors = await form.validateForm()
            await form.submitForm()
            if (errors && Object.keys(errors).length > 0) {
              setIsOpen(false)
              return
            }
            leave()
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
