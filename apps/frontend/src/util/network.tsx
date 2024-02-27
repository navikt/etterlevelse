import { Button, Modal } from '@navikt/ds-react'
import axios from 'axios'
import { useState } from 'react'

let done = false

const init = (onErr: (e: any) => void) => {
  done = true
  axios.interceptors.response.use(
    (res) => {
      return res
    },
    (err) => {
      if (err?.response?.status !== 404) {
        console.error('axios error', err)
        onErr(err)
      }
      return Promise.reject(err)
    }
  )
}

export const useNetworkStatus = () => {
  const [error, setError] = useState<any>()
  !done && init(setError)

  const clear = () => {
    setError(undefined)
  }

  return (
    <Modal
      open={!!error}
      onClose={clear}
      header={{ heading: error?.message ? error?.message : 'Nettverksfeil', closeButton: false }}
    >
      <Modal.Body>
        {error?.response?.data?.message ? error?.response?.data?.message : error?.toString()}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={clear}>Lukk</Button>
      </Modal.Footer>
    </Modal>
  )
}
