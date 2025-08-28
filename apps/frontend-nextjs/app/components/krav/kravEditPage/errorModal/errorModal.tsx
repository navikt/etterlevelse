import { Button, Modal } from '@navikt/ds-react'
import { Dispatch, FunctionComponent } from 'react'

type TProps = {
  isOpen: boolean
  submit: Dispatch<React.SetStateAction<boolean>>
  errorMessage: string
}

const ErrorModal: FunctionComponent<TProps> = ({ isOpen, submit, errorMessage }) => (
  <Modal
    open={isOpen}
    header={{ heading: 'Feilmelding', closeButton: false }}
    onClose={() => submit(false)}
  >
    <Modal.Body>{errorMessage}</Modal.Body>
    <Modal.Footer>
      <Button onClick={() => submit(false)} type='button'>
        Lukk
      </Button>
    </Modal.Footer>
  </Modal>
)

export default ErrorModal
