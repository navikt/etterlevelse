import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'
import { buttonContentStyle } from './common/Button'
import React from 'react'

const ErrorModal = (props: { isOpen: boolean; submit: Function; errorMessage: string }) => {
  return (
    <Modal closeable={false} isOpen={props.isOpen}>
      <ModalHeader>Feilmelding</ModalHeader>
      <ModalBody>{props.errorMessage}</ModalBody>
      <ModalFooter>
        <ModalButton
          onClick={() => props.submit(false)}
          overrides={{
            BaseButton: {
              style: {
                ...buttonContentStyle,
              },
            },
          }}
        >
          <strong>Lukk</strong>
        </ModalButton>
      </ModalFooter>
    </Modal>
  )
}

export default ErrorModal
