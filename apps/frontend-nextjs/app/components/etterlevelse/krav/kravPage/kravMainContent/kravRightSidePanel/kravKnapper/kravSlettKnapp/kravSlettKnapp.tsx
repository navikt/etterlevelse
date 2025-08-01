import { Button, Modal } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useState } from 'react'

type TProps = {
  fun: () => Promise<any>
  redirect: string
  buttonLabel?: string
  buttonSize?: 'small' | 'medium' | 'xsmall'
}

export const KravSlettKnapp: FunctionComponent<TProps> = ({
  fun,
  redirect,
  buttonLabel,
  buttonSize,
}) => {
  const [open, setOpen] = useState(false)
  const router: AppRouterInstance = useRouter()

  return (
    <>
      <Button
        variant='danger'
        onClick={() => setOpen(true)}
        size={buttonSize ? buttonSize : undefined}
      >
        {buttonLabel ? buttonLabel : 'Slett'}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        header={{ heading: 'Bekreft slett', closeButton: false }}
      >
        <Modal.Body>Er du sikker på at du vil slette?</Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpen(false)} size='small' variant='secondary'>
            Avbryt
          </Button>
          <Button onClick={() => fun().then(() => router.push(redirect))} size='small'>
            Slett
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
