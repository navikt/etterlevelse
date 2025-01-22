import { BodyLong, Button, Modal } from '@navikt/ds-react'
import { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

interface IProps {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  navigateUrl: string
  formRef: RefObject<any>
}

export const AccordianAlertModal = (props: IProps) => {
  const { isOpen, setIsOpen, navigateUrl, formRef } = props
  const navigate = useNavigate()

  return (
    <Modal onClose={() => setIsOpen(false)} open={isOpen} header={{ heading: 'Varsel' }}>
      <Modal.Body>
        <BodyLong>Endringene som er gjort er ikke lagret.</BodyLong>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            formRef.current?.submitForm()
            setIsOpen(false)
            navigate(navigateUrl)
          }}
        >
          Lagre og fortsette
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsOpen(false)
            navigate(navigateUrl)
          }}
        >
          Fortsett uten å lagre
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AccordianAlertModal
