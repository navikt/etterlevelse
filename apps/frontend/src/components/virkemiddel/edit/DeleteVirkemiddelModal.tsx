import * as React from 'react'
import {useState} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'baseui/modal'
import {ParagraphMedium} from 'baseui/typography'
import {Button} from 'baseui/button'
import {Block} from 'baseui/block'
import {buttonContentStyle} from '../../common/Button'
import {Virkemiddel} from '../../../constants'
import {deleteVirkemiddel} from '../../../api/VirkemiddelApi'

type ModalDeleteProps = {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
  virkemiddel?: Virkemiddel
  refetchData: () => void
}

const DeleteVirkemiddeltModal = ({ isOpen, setIsOpen, virkemiddel, refetchData }: ModalDeleteProps) => {
  const [errorOnDelete, setErrorOnDelete] = useState('')

  const submit = async (id?: string) => {
    if (virkemiddel) {
      if (id) {
        await deleteVirkemiddel(id)
          .then(() => {
            setIsOpen(false)
            refetchData()
          })
          .catch((e) => {
            setErrorOnDelete(e)
          })
      } else {
        setErrorOnDelete('Fant ikke ID for virkemiddelet')
      }
    } else {
      setErrorOnDelete('Fant ikke virkemiddelet')
    }
  }

  return (
    <Modal closeable={false} onClose={() => setIsOpen(false)} isOpen={isOpen} autoFocus animate size="default">
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
