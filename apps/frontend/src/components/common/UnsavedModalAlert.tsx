import { Button, Modal } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

type TProps = {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  urlToNavigate: string
  formRef?: RefObject<any>
}

export const UnsavedModalAlert: FunctionComponent<TProps> = ({
  isOpen,
  setIsOpen,
  urlToNavigate,
  formRef,
}) => {
  const navigate = useNavigate()
  return (
    <div>
      {isOpen && (
        <Modal
          onClose={() => setIsOpen(false)}
          open={isOpen}
          header={{
            heading: 'Vil du lagre endringene dine før du går videre?',
            closeButton: false,
          }}
        >
          <Modal.Body>
            <br />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type='button'
              onClick={async () => {
                await formRef?.current?.submitForm()
                navigate(urlToNavigate)
                setIsOpen(false)
              }}
            >
              Lagre og fortsette
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={() => {
                navigate(urlToNavigate)
                setIsOpen(false)
              }}
            >
              Fortsett uten å lagre
            </Button>
            <Button
              type='button'
              variant='tertiary'
              onClick={() => {
                setIsOpen(false)
              }}
            >
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
export default UnsavedModalAlert
