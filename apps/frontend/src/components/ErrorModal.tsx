import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader} from "baseui/modal";
import React from "react";

const ErrorModal = (props: { isOpen: boolean, submit: Function, errorMessage: string }) => {
  return (
    <Modal closeable={false} isOpen={props.isOpen} unstable_ModalBackdropScroll>
      <ModalHeader>Feilmelding</ModalHeader>
      <ModalBody>{props.errorMessage}</ModalBody>
      <ModalFooter>
        <ModalButton onClick={() => props.submit(false)}>
          <b>Lukk</b>
        </ModalButton>
      </ModalFooter>
    </Modal>)
}

export default ErrorModal
