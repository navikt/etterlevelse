import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  isOpen: boolean
  onClose: () => void
}

export const AlertFerdigModal: FunctionComponent<TProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onClose={() => onClose()} header={{ heading: 'Varsel' }}>
      <Modal.Body>Kan ikke redigere på en sendt Pvo tilbakemelding</Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onClose()}>Lukk</Button>
      </Modal.Footer>
    </Modal>
  )
}
export default AlertFerdigModal
