import * as React from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { Paragraph2 } from 'baseui/typography'
import { Button } from 'baseui/button'
import { Block } from 'baseui/block'
import { CodeListFormValues } from '../../../services/Codelist'

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
    <Modal onClose={onClose} isOpen={isOpen} autoFocus animate unstable_ModalBackdropScroll={true} size="default">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <Paragraph2>
          {' '}
          Bekreft sletting av code "{initialValues.code}" fra "{initialValues.list}".
        </Paragraph2>
      </ModalBody>

      <ModalFooter>
        <Block display="flex" justifyContent="flex-end">
          <Block marginRight="auto">{errorOnDelete && <p>{errorOnDelete}</p>}</Block>
          <Button kind="secondary" onClick={() => onClose()} overrides={{ BaseButton: { style: { marginRight: '1rem' } } }}>
            <b>Avbryt</b>
          </Button>
          <Button onClick={() => submit({ list: initialValues.list, code: initialValues.code })}>
            <b>Lagre</b>
          </Button>
        </Block>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteCodeListModal
