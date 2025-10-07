import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { Button, Modal } from '@navikt/ds-react'
import { FormikProps } from 'formik'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  isTabAlertActive: boolean
  setIsTabAlertActive: (state: boolean) => void
  isSavingChanges: boolean
  setIsSavingChanges: (state: boolean) => void
  selectedTab: string
  setCurrentTab: (state: string) => void
  etterlevelseFormRef: RefObject<FormikProps<IEtterlevelse> | null | undefined>
}

export const UnsavedEtterlevelseModal: FunctionComponent<TProps> = ({
  isTabAlertActive,
  setIsTabAlertActive,
  isSavingChanges,
  setIsSavingChanges,
  selectedTab,
  setCurrentTab,
  etterlevelseFormRef,
}) => {
  return (
    <Modal
      open={isTabAlertActive}
      onClose={() => setIsTabAlertActive(false)}
      header={{
        heading: 'Vil du lagre endringene dine før du går videre?',
        closeButton: false,
      }}
    >
      <Modal.Body>
        {isSavingChanges && <CenteredLoader />}
        <br />
      </Modal.Body>
      <Modal.Footer>
        <Button
          type='button'
          variant='primary'
          onClick={async () => {
            setCurrentTab(selectedTab)
            setIsSavingChanges(true)
            etterlevelseFormRef.current?.submitForm()
          }}
        >
          Lagre og fortsett
        </Button>

        <Button
          type='button'
          variant='secondary'
          onClick={() => {
            setCurrentTab(selectedTab)
            setIsTabAlertActive(false)
          }}
        >
          Fortsett uten å lagre
        </Button>
        <Button
          type='button'
          variant='tertiary'
          onClick={() => {
            setIsTabAlertActive(false)
          }}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default UnsavedEtterlevelseModal
