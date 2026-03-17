'use client'

import { newVersionEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { BodyLong, Button, LocalAlert, Modal } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'

interface IProps {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  isNewVersionModalOpen: boolean
  setIsNewVersionModalOpen: (state: boolean) => void
}

export const NyVersjonEtterlevelseDokumentasjonModal: FunctionComponent<IProps> = ({
  etterlevelseDokumentasjon,
  isNewVersionModalOpen,
  setIsNewVersionModalOpen,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const submit = async () => {
    await newVersionEtterlevelseDokumentasjon(etterlevelseDokumentasjon)
      .then(() => {
        setIsNewVersionModalOpen(false)
        window.location.reload()
      })
      .catch((e) => {
        const message = e?.response?.data?.message || e?.message || 'Arkivering feilet'
        setErrorMessage(message)
      })
  }

  return (
    <Modal
      width='30rem'
      open={isNewVersionModalOpen}
      onClose={() => {
        setIsNewVersionModalOpen(false)
      }}
      header={{ heading: 'Lås opp og oppdater dokumentasjon', closeButton: false }}
    >
      <Modal.Body>
        <BodyLong className='mb-5'>
          Ved opplåsing oppretter dere en ny versjon som dere kan redigere.
        </BodyLong>
        <BodyLong>
          Etter hvert som dere er klare, kan dere sende den nye versjonen til godkjenning på nytt.
        </BodyLong>

        {errorMessage !== '' && (
          <LocalAlert status='error' className='my-5'>
            <LocalAlert.Header>
              <LocalAlert.Title>{errorMessage}</LocalAlert.Title>
              <LocalAlert.CloseButton onClick={() => setErrorMessage('')} />
            </LocalAlert.Header>
          </LocalAlert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button type='button' variant='primary' onClick={async () => await submit()}>
          Oppdater
        </Button>
        <Button type='button' variant='secondary' onClick={() => setIsNewVersionModalOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default NyVersjonEtterlevelseDokumentasjonModal
