import { Button, Modal } from '@navikt/ds-react'

const ErrorModal = (props: {
  isOpen: boolean
  submit: React.Dispatch<React.SetStateAction<boolean>>
  errorMessage: string
}) => {
  return (
    <Modal
      open={props.isOpen}
      header={{ heading: 'Feilmelding', closeButton: false }}
      onClose={() => props.submit(false)}
    >
      <Modal.Body>{props.errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button onClick={() => props.submit(false)} type="button">
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ErrorModal
