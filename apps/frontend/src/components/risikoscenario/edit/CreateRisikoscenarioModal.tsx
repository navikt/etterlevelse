import { Button, Loader, Modal } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { getPvkDokument } from '../../../api/PvkDokumentApi'
import { createRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IPvkDokument, IRisikoscenario } from '../../../constants'
import AlertPvoUnderarbeidModal from '../../PvkDokument/common/AlertPvoUnderarbeidModal'
import { isReadOnlyPvkStatus } from '../../PvkDokument/common/util'
import { risikoscenarioUrl } from '../../common/RouteLinkPvk'
import RisikoscenarioModalForm from './RisikoscenarioModalForm'

type TProps = {
  pvkDokument: IPvkDokument
  onSubmitStateUpdate?: (risikoscenario: IRisikoscenario) => void
  formRef: RefObject<any>
}

export const CreateRisikoscenarioModal: FunctionComponent<TProps> = ({
  pvkDokument,
  onSubmitStateUpdate,
  formRef,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isPvoAlertModal, setIsPvoAlertModal] = useState<boolean>(false)
  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await createRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      if (onSubmitStateUpdate) {
        onSubmitStateUpdate(response)
      }
      setIsEdit(false)

      navigate(risikoscenarioUrl(response.id))
    })
  }

  return (
    <div className='mt-5'>
      {!isEdit && (
        <Button
          onClick={async () =>
            await getPvkDokument(pvkDokument.id).then((response) => {
              if (isReadOnlyPvkStatus(response.status)) {
                setIsPvoAlertModal(true)
              } else {
                if (formRef && formRef.current && formRef.current.dirty) {
                  setIsUnsavedModalOpen(true)
                } else {
                  setIsEdit(true)
                }
              }
            })
          }
          variant='secondary'
        >
          Opprett nytt øvrig risikoscenario
        </Button>
      )}

      {isPvoAlertModal && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModal}
          onClose={() => setIsPvoAlertModal(false)}
          pvkDokumentId={pvkDokument.id}
        />
      )}

      {isUnsavedModalOpen && (
        <Modal
          open={isUnsavedModalOpen}
          header={{
            heading: 'Vil du lagre endringen din før du oppretter et nytt risikoscenario?',
          }}
          onClose={() => setIsUnsavedModalOpen(false)}
        >
          <Modal.Body>
            {isSavingChanges && (
              <div className='flex justify-center items-center w-full'>
                <Loader size='2xlarge' title='lagrer endringer' />
              </div>
            )}
            <br />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type='button'
              variant='primary'
              onClick={async () => {
                setIsSavingChanges(true)
                await formRef.current.submitForm()
                formRef.current.resetForm(formRef.current.values)
                setIsEdit(true)
                setIsUnsavedModalOpen(false)
              }}
            >
              Lagre og fortsett
            </Button>

            <Button
              type='button'
              variant='secondary'
              onClick={async () => {
                formRef.current.resetForm(formRef.current.initialValues)
                setIsUnsavedModalOpen(false)
                setIsEdit(true)
              }}
            >
              Fortsett uten å lagre
            </Button>
            <Button
              type='button'
              variant='tertiary'
              onClick={() => {
                setIsPvoAlertModal(false)
              }}
            >
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {isEdit && (
        <RisikoscenarioModalForm
          headerText='Opprett nytt risikoscenario'
          isOpen={isEdit}
          setIsOpen={setIsEdit}
          submit={submit}
          initialValues={{
            pvkDokumentId: pvkDokument.id,
            generelScenario: true,
          }}
        />
      )}
    </div>
  )
}

export default CreateRisikoscenarioModal
