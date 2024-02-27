import { Button, Modal } from '@navikt/ds-react'

type TAlertUnsavedPopupProps = {
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  onSubmit: () => void
}

export const AlertUnsavedPopup = ({
  isModalOpen,
  setIsModalOpen,
  onClose,
  onSubmit,
}: TAlertUnsavedPopupProps) => {
  return (
    <>
      <Modal
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        header={{
          heading: 'Er du sikkert på at du vil forlate redigerings siden uten å lagre?',
          closeButton: false,
        }}
      >
        <Modal.Body>
          <Button
            onClick={() => {
              onSubmit()
              setIsModalOpen(false)
            }}
          >
            Lagre og fortsett
          </Button>
          <Button
            className="ml-2.5"
            onClick={() => {
              onClose()
              setIsModalOpen(false)
            }}
          >
            Fortsett uten å lagre
          </Button>
          <Button
            className="ml-2.5"
            variant="secondary"
            onClick={() => {
              setIsModalOpen(false)
            }}
          >
            Avbryt
          </Button>
        </Modal.Body>
      </Modal>
    </>
  )
}
export default AlertUnsavedPopup
