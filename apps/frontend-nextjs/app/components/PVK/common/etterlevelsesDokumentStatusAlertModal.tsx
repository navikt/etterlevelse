'use client'
import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  isOpen: boolean
  onClose: () => void
}

export const EtterlevelsesDokumentStatusAlertModal: FunctionComponent<TProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal open={isOpen} onClose={() => onClose()} header={{ heading: 'Kan ikke redigeres' }}>
      <Modal.Body>Kan ikke redigers pga statusen til etterlevelsesdokumentet</Modal.Body>
      <Modal.Footer>
        <Button type='button' onClick={() => onClose()}>
          Lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
