import { Button, Modal, Textarea } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { FunctionComponent, useState } from 'react'
import { deleteKrav } from '@/api/krav/kravApi'

type TProps = {
  kravId: string
  redirect: string
  buttonLabel?: string
  buttonSize?: 'small' | 'medium' | 'xsmall'
}

export const KravSlettKnapp: FunctionComponent<TProps> = ({
  kravId,
  redirect,
  buttonLabel,
  buttonSize,
}) => {
  const [open, setOpen] = useState(false)
  const router: AppRouterInstance = useRouter()
  const [deleteComment, setDeleteComment] = useState<string>('')

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
        <Modal.Body>
          Er du sikker på at du vil slette?
          <Textarea
            label='Begrunnelse for sletting (påkrevd)'
            onChange={(e) => setDeleteComment(e.target.value)}
            className='w-full mt-3'
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpen(false)} size='small' variant='secondary'>
            Avbryt
          </Button>
          <Button
            disabled={deleteComment === ''}
            onClick={() => deleteKrav(kravId, deleteComment).then(() => router.push(redirect))}
            size='small'
          >
            Slett
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
