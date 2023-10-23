import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button, Modal} from "@navikt/ds-react";
import {TrashIcon} from "@navikt/aksel-icons";

export const DeleteItem = (props: { fun: () => Promise<any>; redirect: string }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Button
        variant="tertiary"
        onClick={() => setOpen(true)}
        icon={<TrashIcon/>}
      >
        Slett
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} header={{ heading: "Bekreft slett" }}>
        <Modal.Body>Er du sikker på at du vil slette?</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpen(false)} size={'small'} variant={'secondary'}>
            Avbryt
          </Button>
          <Button onClick={() => props.fun().then(() => navigate(props.redirect))} size={'small'}>
            Slett
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
