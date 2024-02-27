import { Button, Modal } from '@navikt/ds-react'
import { ReactNode } from 'react'

interface IPropsKravEditStatusModal {
  status: string
  open: boolean
  setKravMessage: () => void
  avbrytHandling: string
  brukerBeskjed: string
  children: ReactNode
}

export const KravEditStatusModal = ({
  status,
  open,
  setKravMessage,
  avbrytHandling,
  brukerBeskjed,
  children,
}: IPropsKravEditStatusModal) => (
  <Modal
    header={{
      closeButton: false,
      heading: `Sikker på at du vil sette kravet til ${status}?`,
    }}
    open={open}
    onClose={() => setKravMessage()}
  >
    <Modal.Body>{brukerBeskjed}</Modal.Body>
    <Modal.Footer>
      <Button type="button" variant="secondary" onClick={() => setKravMessage()}>
        {avbrytHandling}
      </Button>
      {children}
    </Modal.Footer>
  </Modal>
)
