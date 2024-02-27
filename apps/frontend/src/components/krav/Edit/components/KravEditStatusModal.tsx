import { Button, Modal } from '@navikt/ds-react'
import { ReactNode } from 'react'

interface IPropsKravEditStatusModal {
  status: 'aktiv' | 'utgått'
  open: boolean
  setKravMessage: () => void
  brukerBeskjed: string
  children: ReactNode
}

export const KravEditStatusModal = ({
  status,
  open,
  setKravMessage,
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
        Nei, avbryt handlingen
      </Button>
      {children}
    </Modal.Footer>
  </Modal>
)
