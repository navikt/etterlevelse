import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { ParagraphMedium } from 'baseui/typography'
import { useState } from 'react'
import { deleteVirkemiddel } from '../../../api/VirkemiddelApi'
import { IVirkemiddel } from '../../../constants'
import { buttonContentStyle } from '../../common/Button'

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
      closeable={false}
      onClose={() => setIsOpen(false)}
      isOpen={isOpen}
      animate
      size="default"
    >
      <ModalHeader>Bekreft sletting.</ModalHeader>
      <ModalBody>
        <ParagraphMedium> Bekreft sletting av {virkemiddel?.navn}.</ParagraphMedium>
      </ModalBody>

      <ModalFooter>
        <Block display="flex" justifyContent="flex-end">
          <Block marginRight="auto">{errorOnDelete && <p>{errorOnDelete}</p>}</Block>
          <Button
            kind="secondary"
            onClick={() => setIsOpen(false)}
            overrides={{
              BaseButton: {
                style: {
                  marginRight: '1rem',
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Avbryt</strong>
          </Button>
          <Button
            onClick={() => submit(virkemiddel?.id)}
            overrides={{
              BaseButton: {
                style: {
                  ...buttonContentStyle,
                },
              },
            }}
          >
            <strong>Slett</strong>
          </Button>
        </Block>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteVirkemiddeltModal
