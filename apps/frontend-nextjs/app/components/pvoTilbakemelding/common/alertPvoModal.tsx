'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Button, Loader, Modal } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'

type TProps = {
  isOpen: boolean
  onClose: () => void
  pvkDokumentId: string
}

export const AlertPvoModal: FunctionComponent<TProps> = ({ isOpen, onClose, pvkDokumentId }) => {
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await getPvkDokument(pvkDokumentId)
        .then(setPvkDokument)
        .finally(() => setIsLoading(false))
    })()
  }, [])

  return (
    <Modal open={isOpen} onClose={() => onClose()} header={{ heading: 'Varsel' }}>
      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}
      {!isLoading && (
        <div>
          {pvkDokument && pvkDokument.status === EPvkDokumentStatus.UNDERARBEID && (
            <Modal.Body>
              Kan ikke redigere fordi etterleveren har trukket tilbake innsendingen.
            </Modal.Body>
          )}
          {pvkDokument && pvkDokument.status !== EPvkDokumentStatus.UNDERARBEID && (
            <Modal.Body>Kan ikke redigere på en sendt Pvo tilbakemelding</Modal.Body>
          )}
          <Modal.Footer>
            <Button type='button' onClick={() => onClose()}>
              Lukk
            </Button>
          </Modal.Footer>
        </div>
      )}
    </Modal>
  )
}
export default AlertPvoModal
