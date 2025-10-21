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

export const AlertPvoUnderArbeidModal: FunctionComponent<TProps> = ({
  isOpen,
  onClose,
  pvkDokumentId,
}) => {
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
    <Modal open={isOpen} onClose={() => onClose()} header={{ heading: 'Kan ikke redigeres' }}>
      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}
      {!isLoading && (
        <div>
          {pvkDokument &&
            [
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
            ].includes(pvkDokument.status) && (
              <Modal.Body>Pvk dokumentet er sendt til Personvernombudet</Modal.Body>
            )}
          {pvkDokument &&
            ![
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
            ].includes(pvkDokument.status) && (
              <Modal.Body>Personvernombudet har påbegynt vurderingen</Modal.Body>
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

export default AlertPvoUnderArbeidModal
