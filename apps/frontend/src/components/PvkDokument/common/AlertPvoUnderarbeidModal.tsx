import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  isOpen: boolean
  onClose: () => void
}

export const AlertPvoUnderarbeidModal: FunctionComponent<TProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onClose={() => onClose()} header={{ heading: 'Kan ikke redigeres' }}>
      <Modal.Body>Personvernombudet har påbegynt vurderingen</Modal.Body>
      <Modal.Footer>
        <Button type='button' onClick={() => onClose()}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AlertPvoUnderarbeidModal
