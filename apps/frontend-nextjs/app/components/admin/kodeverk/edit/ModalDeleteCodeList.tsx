'use client'

import { BodyShort, Button, Modal, Textarea } from '@navikt/ds-react'
import { useState } from 'react'
import { ICodeListFormValues } from '@/constants/kodeverk/kodeverkConstants'

type TModalDeleteProps = {
  title: string
  initialValues: ICodeListFormValues
  isOpen: boolean
  errorOnDelete: any | undefined
  submit: (code: ICodeListFormValues, deleteMessage: string) => void
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
  const [deleteComment, setDeleteComment] = useState<string>('')

  return (
    <Modal onClose={onClose} open={isOpen} header={{ heading: title, closeButton: false }}>
      <Modal.Body>
        <BodyShort>
          Bekreft sletting av kode &quot;{initialValues.code}&quot; fra &quot;{initialValues.list}
          &quot;.
        </BodyShort>

        <Textarea
          label='Begrunnelse for sletting  (påkrevd)'
          onChange={(e) => setDeleteComment(e.target.value)}
          className='w-full mt-3'
        />
      </Modal.Body>

      <Modal.Footer>
        <div className='flex justify-end'>
          <div className='mr-auto'>{errorOnDelete && <BodyShort>{errorOnDelete}</BodyShort>}</div>
          <Button variant='secondary' onClick={() => onClose()} className='mr-4'>
            Avbryt
          </Button>
          <Button
            disabled={deleteComment === ''}
            onClick={() =>
              submit({ list: initialValues.list, code: initialValues.code }, deleteComment)
            }
          >
            Slett
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteCodeListModal
