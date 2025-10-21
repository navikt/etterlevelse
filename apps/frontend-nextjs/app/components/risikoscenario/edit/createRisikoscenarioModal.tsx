'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { createRisikoscenario } from '@/api/risikoscenario/risikoscenarioApi'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Button, Loader, Modal } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useState } from 'react'
import RisikoscenarioModalForm from '../form/risikoscenarioModalForm'

type TProps = {
  pvkDokument: IPvkDokument
  onSubmitStateUpdate?: (risikoscenario: IRisikoscenario) => void
  formRef: RefObject<any>
  setIsIngenTilgangFormDirty: (state: boolean) => void
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (state: boolean) => void
}

export const CreateRisikoscenarioModal: FunctionComponent<TProps> = ({
  pvkDokument,
  onSubmitStateUpdate,
  setIsIngenTilgangFormDirty,
  formRef,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const router = useRouter()
  const queryParam = useSearchParams()
  const steg = queryParam.get('steg') || undefined
  const [isPvoAlertModal, setIsPvoAlertModal] = useState<boolean>(false)
  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await createRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      if (onSubmitStateUpdate) {
        onSubmitStateUpdate(response)
      }
      setIsCreateModalOpen(false)

      router.push(risikoscenarioUrl(response.id, steg), { scroll: false })
    })
  }

  return (
    <div className='mt-5'>
      {!isCreateModalOpen && (
        <Button
          onClick={async () =>
            await getPvkDokument(pvkDokument.id).then((response) => {
              if (isReadOnlyPvkStatus(response.status)) {
                setIsPvoAlertModal(true)
              } else {
                if (formRef && formRef.current && formRef.current.dirty) {
                  setIsUnsavedModalOpen(true)
                } else {
                  setIsCreateModalOpen(true)
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
        <AlertPvoUnderArbeidModal
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
                await formRef.current.resetForm(formRef.current.values)
                setIsCreateModalOpen(true)
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
                setIsIngenTilgangFormDirty(false)
                setIsUnsavedModalOpen(false)
                setIsCreateModalOpen(true)
              }}
            >
              Fortsett uten å lagre
            </Button>
            <Button
              type='button'
              variant='tertiary'
              onClick={() => {
                setIsUnsavedModalOpen(false)
              }}
            >
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {isCreateModalOpen && (
        <RisikoscenarioModalForm
          headerText='Opprett nytt risikoscenario'
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
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
