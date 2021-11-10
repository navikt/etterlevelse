import axios from 'axios'
import React, { useState } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'

let done = false

const init = (onErr: (e: any) => void) => {
  done = true
  axios.interceptors.response.use(
    (res) => {
      return res
    },
    (err) => {
      if (err?.response?.status !== 404) {
        console.log('axios error', err)
        onErr(err)
      }
      return Promise.reject(err)
    },
  )
}

export const useNetworkStatus = () => {
  const [error, setError] = useState<any>()
  !done && init(setError)

  const clear = () => {
    setError(undefined)
  }

  return (
    <Modal closeable={false} isOpen={error} onClose={clear} unstable_ModalBackdropScroll>
      <ModalHeader>Nettverksfeil</ModalHeader>
      <ModalBody>{error?.toString()}</ModalBody>
      <ModalFooter>
        <ModalButton onClick={clear}>
          <strong>Lukk</strong>
        </ModalButton>
      </ModalFooter>
    </Modal>
  )
}
