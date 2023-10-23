import { CodeListFormValues } from '../../../services/Codelist'
import { buttonContentStyle } from '../../common/Button'
import { BodyShort, Button, Modal } from '@navikt/ds-react'

type ModalDeleteProps = {
  title: string
  initialValues: CodeListFormValues
  isOpen: boolean
  errorOnDelete: any | undefined
  submit: (code: CodeListFormValues) => void
  onClose: () => void
}

const DeleteCodeListModal = ({ title, initialValues, isOpen, errorOnDelete, submit, onClose }: ModalDeleteProps) => {
  return (
    <Modal onClose={onClose} open={isOpen} header={{ heading: title }}>
      <Modal.Body>
        <BodyShort>
          Bekreft sletting av kode "{initialValues.code}" fra "{initialValues.list}".
        </BodyShort>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end">
          <div className="mr-auto">{errorOnDelete && <BodyShort>{errorOnDelete}</BodyShort>}</div>
          <Button
            variant="secondary"
            onClick={() => onClose()}
            className="mr-4"
          >
            Avbryt
          </Button>
          <Button
            onClick={() => submit({ list: initialValues.list, code: initialValues.code })}
          >
            Slett
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteCodeListModal
