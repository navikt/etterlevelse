import { Button, Modal } from '@navikt/ds-react'
import { EKravStatus, TKravQL } from '../../../../constants'

interface IPropsKravEditSettKravTilUtgattModal {
  utgaattKravMessage: boolean
  setUtgaattKravMessage: (value: React.SetStateAction<boolean>) => void
  values: TKravQL
  submitForm: () => Promise<void>
}

export const KravEditSettKravTilUtgattModal = ({
  utgaattKravMessage,
  setUtgaattKravMessage,
  values,
  submitForm,
}: IPropsKravEditSettKravTilUtgattModal) => (
  <Modal
    header={{
      closeButton: false,
      heading: 'Sikker på at du vil sette kravet til utgått?',
    }}
    open={utgaattKravMessage}
    onClose={() => setUtgaattKravMessage(false)}
  >
    <Modal.Body>Denne handligen kan ikke reverseres</Modal.Body>
    <Modal.Footer>
      <Button
        type="button"
        className="mr-4"
        variant="secondary"
        onClick={() => setUtgaattKravMessage(false)}
      >
        Nei, avbryt handlingen
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          values.status = EKravStatus.UTGAATT
          submitForm()
          setUtgaattKravMessage(false)
        }}
      >
        Ja, sett til utgått
      </Button>
    </Modal.Footer>
  </Modal>
)
