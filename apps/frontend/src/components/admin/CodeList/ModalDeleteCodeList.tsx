import * as React from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { ParagraphMedium } from 'baseui/typography'
import { Button } from 'baseui/button'
import { Block } from 'baseui/block'
import { CodeListFormValues } from '../../../services/Codelist'
import { buttonContentStyle } from '../../common/Button'

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
    <Modal closeable={false} onClose={onClose} isOpen={isOpen} autoFocus animate size="default">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <ParagraphMedium>
          {' '}
          Bekreft sletting av kode "{initialValues.code}" fra "{initialValues.list}".
        </ParagraphMedium>
      </ModalBody>

      <ModalFooter>
        <Block display="flex" justifyContent="flex-end">
          <Block marginRight="auto">{errorOnDelete && <p>{errorOnDelete}</p>}</Block>
          <Button
            kind="secondary"
            onClick={() => onClose()}
            overrides={{
              BaseButton: {
                style: {
                  marginRight: '1rem',
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Avbryt</strong>
          </Button>
          <Button
            onClick={() => submit({ list: initialValues.list, code: initialValues.code })}
            overrides={{
              BaseButton: {
                style: {
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Slett</strong>
          </Button>
        </Block>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteCodeListModal
