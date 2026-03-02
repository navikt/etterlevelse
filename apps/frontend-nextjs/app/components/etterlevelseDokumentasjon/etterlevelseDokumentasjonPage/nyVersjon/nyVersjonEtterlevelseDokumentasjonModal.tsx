'use client'

import { newVersionEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button, Modal } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const submit = async () => {
    await newVersionEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then(() => {
      router.refresh()
      setIsNewVersionModalOpen(false)
    })
  }

  return (
    <Modal
      width='30rem'
      open={isNewVersionModalOpen}
      onClose={() => {
        setIsNewVersionModalOpen(false)
      }}
      header={{ heading: 'Ny etterlevelse dokument versjon', closeButton: false }}
    >
      <Modal.Body>Er du sikkert på at du vil øke versjon</Modal.Body>
      <Modal.Footer>
        <Button type='button' variant='primary' onClick={async () => await submit()}>
          Ja, øk versjon
        </Button>
        <Button type='button' variant='secondary' onClick={() => setIsNewVersionModalOpen(false)}>
          Nei, lukk
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default NyVersjonEtterlevelseDokumentasjonModal
