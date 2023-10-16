import { useState } from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { useNavigate } from 'react-router-dom'
import { Button } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'

export const DeleteItem = (props: { fun: () => Promise<any>; redirect: string }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Button variant="tertiary" className="text-white max-h-16" onClick={() => setOpen(true)}>
        <div className="flex flex-nowrap items-center gap-1">
          <TrashIcon className="text-2xl" />
          Slett
        </div>
      </Button>
      <Modal closeable={false} isOpen={open} onClose={() => setOpen(false)}>
        <ModalHeader>Bekreft slett</ModalHeader>
        <ModalBody>Er du sikker på at du vil slette?</ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)} variant={'secondary'}>
            Avbryt
          </Button>
          <Button onClick={() => props.fun().then(() => navigate(props.redirect))}>Slett</Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
