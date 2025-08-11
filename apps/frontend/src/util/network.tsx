import { Alert, Button, Modal } from '@navikt/ds-react'
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
        if (err?.response?.data?.message.includes('Kan ikke fjerne gjenbruk ')) {
          onErr({
            ...err,
            message: 'Det er ikke mulig å fjerne gjenbruk',
            response: {
              ...err.response,
              data: {
                ...err.response.data,
                message:
                  'Dette dokumentet har allerede blitt gjenbrukt minst 1 gang. Det gjør at du ikke lenger kan fjerne mulighet for gjenbruk.',
              },
            },
          })
        }
      }
      return Promise.reject(err)
    }
  )
}

export const useNetworkStatus = () => {
  const [error, setError] = useState<any>()
  if (!done) {
    init(setError)
  }

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

        {error?.message?.includes('fjerne gjenbruk') && (
          <Alert variant='info' inline className='my-5'>
            Hvis du vil skjule gjenbruksmulighet for andre, kan du skru den av på Temaside under
            &quot;Endre gjenbruk&quot;.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={clear}>Lukk</Button>
      </Modal.Footer>
    </Modal>
  )
}
