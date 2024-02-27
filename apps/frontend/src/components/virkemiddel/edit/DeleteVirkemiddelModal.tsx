import { BodyShort, Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import { deleteVirkemiddel } from '../../../api/VirkemiddelApi'
import { IVirkemiddel } from '../../../constants'

type TModalDeleteProps = {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  virkemiddel?: IVirkemiddel
  refetchData: () => void
}

const DeleteVirkemiddeltModal = ({
  isOpen,
  setIsOpen,
  virkemiddel,
  refetchData,
}: TModalDeleteProps) => {
  const [errorOnDelete, setErrorOnDelete] = useState('')

  const submit = async (id?: string) => {
    try {
      if (id) {
        await deleteVirkemiddel(id).then(() => {
          setIsOpen(false)
          refetchData()
        })
      }
    } catch (error: any) {
      setErrorOnDelete(error.message)
    }
  }

  return (
    <Modal
      onClose={() => setIsOpen(false)}
      open={isOpen}
      header={{ heading: 'Bekreft sletting.', closeButton: false }}
      width="medium"
    >
      <Modal.Body>
        <BodyShort> Bekreft sletting av {virkemiddel?.navn}.</BodyShort>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end">
          <div className="mr-auto">{errorOnDelete && <p>{errorOnDelete}</p>}</div>
          <Button
            variant="secondary"
            type="button"
            className="mr-2"
            onClick={() => setIsOpen(false)}
          >
            Avbryt
          </Button>
          <Button type="button" onClick={() => submit(virkemiddel?.id)}>
            Slett
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default DeleteVirkemiddeltModal
