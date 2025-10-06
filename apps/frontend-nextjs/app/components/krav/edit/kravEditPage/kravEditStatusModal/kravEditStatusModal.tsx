import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  status: 'aktiv' | 'utgått'
  open: boolean
  setKravMessage: () => void
  brukerBeskjed: string
  children: ReactNode
  formComponent?: ReactNode
}

export const KravEditStatusModal: FunctionComponent<TProps> = ({
  status,
  open,
  setKravMessage,
  brukerBeskjed,
  children,
  formComponent,
}) => (
  <Modal
    header={{
      closeButton: false,
      heading: `Sikker på at du vil sette kravet til ${status}?`,
    }}
    open={open}
    onClose={() => setKravMessage()}
  >
    <Modal.Body>
      {brukerBeskjed}

      {formComponent && <div className='mt-4'>{formComponent}</div>}
    </Modal.Body>
    <Modal.Footer>
      {children}
      <Button type='button' variant='secondary' onClick={() => setKravMessage()}>
        Nei, avbryt handlingen
      </Button>
    </Modal.Footer>
  </Modal>
)
