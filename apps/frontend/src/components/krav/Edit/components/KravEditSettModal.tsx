import { Button, Modal } from '@navikt/ds-react'
import { ReactNode } from 'react'

interface IPropsKravEditSettModal {
  status: string
  open: boolean
  setKravMessage: () => void
  avbrytHandling: string
  brukerBeskjed: string
  children: ReactNode
}

export const KravEditSettModal = ({
  status,
  open,
  setKravMessage,
  avbrytHandling,
  brukerBeskjed,
  children,
}: IPropsKravEditSettModal) => (
  <Modal
    header={{
      closeButton: false,
      heading: `Sikker på at du vil sette kravet til ${status}`,
    }}
    open={open}
    onClose={() => setKravMessage()}
  >
    <Modal.Body>{brukerBeskjed}</Modal.Body>
    <Modal.Footer>
      {children}
      <Button type="button" variant="secondary" onClick={() => setKravMessage()}>
        {avbrytHandling}
      </Button>
    </Modal.Footer>
  </Modal>
)
