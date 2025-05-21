import { Button, Loader, Modal } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { getPvkDokument } from '../../../api/PvkDokumentApi'
import { EPvkDokumentStatus, IPvkDokument } from '../../../constants'

type TProps = {
  isOpen: boolean
  onClose: () => void
  pvkDokumentId: string
}

export const AlertPvoUnderarbeidModal: FunctionComponent<TProps> = ({
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
          {pvkDokument && pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
            <Modal.Body>Pvk dokumentet er sendt til Personvernombudet</Modal.Body>
          )}
          {pvkDokument && pvkDokument.status !== EPvkDokumentStatus.SENDT_TIL_PVO && (
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

export default AlertPvoUnderarbeidModal
