'use client'

import { Button, Modal } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  navigateUrl?: string
  formRef: RefObject<any>
  reloadOnSubmit?: boolean
  customOnClick?: () => void
}

export const AccordianAlertModal: FunctionComponent<TProps> = ({
  isOpen,
  setIsOpen,
  navigateUrl,
  formRef,
  reloadOnSubmit,
  customOnClick,
}) => {
  const router = useRouter()

  return (
    <Modal
      onClose={() => setIsOpen(false)}
      open={isOpen}
      header={{ heading: 'Vil du lagre endringene dine før du går videre?', closeButton: false }}
    >
      <Modal.Body>
        <br />
      </Modal.Body>
      <Modal.Footer>
        <Button
          type='button'
          onClick={async () => {
            await formRef.current?.submitForm()
            setIsOpen(false)
            if (customOnClick) {
              customOnClick()
            }
            if (navigateUrl) {
              router.push(navigateUrl)
            }
            if (reloadOnSubmit) {
              window.location.reload()
            }
          }}
        >
          Lagre og fortsette
        </Button>
        <Button
          type='button'
          variant='secondary'
          onClick={async () => {
            const values: any = formRef.current?.values
            await formRef.current?.resetForm({ values })
            setIsOpen(false)
            if (customOnClick) {
              customOnClick()
            }
            if (navigateUrl) {
              router.push(navigateUrl)
            }
          }}
        >
          Fortsett uten å lagre
        </Button>
        <Button
          type='button'
          variant='tertiary'
          onClick={() => {
            setIsOpen(false)
          }}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AccordianAlertModal
