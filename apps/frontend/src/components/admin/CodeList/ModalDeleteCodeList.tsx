import { BodyShort, Button, Modal } from '@navikt/ds-react'
import { ICodeListFormValues } from '../../../services/Codelist'

type TModalDeleteProps = {
  title: string
  initialValues: ICodeListFormValues
  isOpen: boolean
  errorOnDelete: any | undefined
  submit: (code: ICodeListFormValues) => void
  onClose: () => void
}

const DeleteCodeListModal = ({
  title,
  initialValues,
  isOpen,
  errorOnDelete,
  submit,
  onClose,
}: TModalDeleteProps) => {
  return (
    <Modal onClose={onClose} open={isOpen} header={{ heading: title, closeButton: false }}>
      <Modal.Body>
        <BodyShort>
          Bekreft sletting av kode &quot;{initialValues.code}&quot; fra &quot;{initialValues.list}
          &quot;.
        </BodyShort>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end">
          <div className="mr-auto">{errorOnDelete && <BodyShort>{errorOnDelete}</BodyShort>}</div>
          <Button variant="secondary" onClick={() => onClose()} className="mr-4">
            Avbryt
          </Button>
          <Button onClick={() => submit({ list: initialValues.list, code: initialValues.code })}>
            Slett
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteCodeListModal
