import Button from './common/Button'
import React, { useState } from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { useHistory } from 'react-router-dom'
import { deleteIcon } from './Images'

export const DeleteItem = (props: { fun: () => Promise<any>; redirect: string }) => {
  const [open, setOpen] = useState(false)
  const history = useHistory()

  return (
    <>
      <Button
        startEnhancer={<img src={deleteIcon} alt="delete" />}
        $style={{ color: '#F8F8F8', ':hover': { backgroundColor: 'transparent', textDecoration: 'underline 3px' } }}
        kind="tertiary"
        size="compact"
        onClick={() => setOpen(true)}
        marginLeft
      >
        Slett
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} unstable_ModalBackdropScroll>
        <ModalHeader>Bekreft slett</ModalHeader>
        <ModalBody>Er du sikker på at du vil slette?</ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)} size={'compact'} kind={'secondary'}>
            Avbryt
          </Button>
          <Button onClick={() => props.fun().then(() => history.push(props.redirect))} size={'compact'}>
            Slett
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
