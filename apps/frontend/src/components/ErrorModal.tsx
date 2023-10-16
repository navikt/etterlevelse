import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'

const ErrorModal = (props: { isOpen: boolean; submit: Function; errorMessage: string }) => {
  return (
    <Modal closeable={false} isOpen={props.isOpen}>
      <ModalHeader>Feilmelding</ModalHeader>
      <ModalBody>{props.errorMessage}</ModalBody>
      <ModalFooter>
        <ModalButton onClick={() => props.submit(false)}>
          <strong>Lukk</strong>
        </ModalButton>
      </ModalFooter>
    </Modal>
  )
}

export default ErrorModal
