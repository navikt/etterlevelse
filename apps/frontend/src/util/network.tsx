import axios from 'axios'
import React, { useState } from 'react'
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader } from 'baseui/modal'
import { buttonContentStyle } from '../components/common/Button'

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
    <Modal closeable={false} isOpen={error} onClose={clear}>
      <ModalHeader>{error?.message ? error?.message : 'Nettverksfeil'}</ModalHeader>
      <ModalBody>{error?.response?.data?.message ? error?.response?.data?.message : error?.toString()}</ModalBody>
      <ModalFooter>
        <ModalButton onClick={clear} overrides={{ BaseButton: { style: { ...buttonContentStyle } } }}>
          <strong>Lukk</strong>
        </ModalButton>
      </ModalFooter>
    </Modal>
  )
}
