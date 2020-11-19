import axios from 'axios'
import React, { useState } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'

let done = false

const init = (onErr: (e: any) => void) => {
  done = true
  axios.interceptors.response.use(res => {
    return res
  }, err => {
    console.log("axios error")
    onErr(err)
    return Promise.reject(err)
  })
}

export const useNetworkStatus = () => {
  const [error, setError] = useState<any>()
  !done && init(setError)

  const clear = () => {
    setError(undefined)
  }

  return (
    <Modal isOpen={error} onClose={clear}>
      <ModalHeader>
        Nettverksfeil
      </ModalHeader>
      <ModalBody>
        {error?.toString()}
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={clear}>Lukk</ModalButton>
      </ModalFooter>
    </Modal>
  )
}
