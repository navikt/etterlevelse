'use client'

import { newVersionEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { BodyLong, Button, Modal } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

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
  const submit = async () => {
    await newVersionEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then(() => {
      setIsNewVersionModalOpen(false)
      window.location.reload()
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
