'use client'

import { Button, Loader, Modal } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'

type TProps = {
  isOpen: boolean
  onClose: () => void
  pvkDokumentId: string
}

const AlertPvoModal: FunctionComponent<TProps> = ({ isOpen, onClose, pvkDokumentId }) => {
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
              Kan ikke angre tilbakemeldingen fordi PVK-en ikke er sendt til PVO.
            </Modal.Body>
          )}
          {pvkDokument && pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
            <Modal.Body>
              Kan ikke angre tilbakemeldingen fordi PVK-en er sendt til risikoeier for godkjenning.
            </Modal.Body>
          )}
          {pvkDokument && pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && (
            <Modal.Body>
              Kan ikke angre tilbakemeldingen fordi PVK-en er godkjent av risikoeier.
            </Modal.Body>
          )}
          {pvkDokument &&
            ![
              EPvkDokumentStatus.UNDERARBEID,
              EPvkDokumentStatus.TRENGER_GODKJENNING,
              EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER,
            ].includes(pvkDokument.status) && (
              <Modal.Body>Tilbakemeldingen er allerede sendt og kan ikke angres.</Modal.Body>
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
