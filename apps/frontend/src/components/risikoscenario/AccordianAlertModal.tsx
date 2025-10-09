import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'

type TProps = {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  navigateUrl?: string
  formRef: RefObject<any>
  reloadOnSubmit?: boolean
  customOnClick?: () => void
}

export const RisikoscenarioAccordianAlertModal: FunctionComponent<TProps> = ({
  isOpen,
  setIsOpen,
  navigateUrl,
  formRef,
  reloadOnSubmit,
  customOnClick,
}) => {
  const navigate: NavigateFunction = useNavigate()

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
              navigate(navigateUrl)
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
              navigate(navigateUrl)
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

export default RisikoscenarioAccordianAlertModal
