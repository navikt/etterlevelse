import { Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
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
}

export const CreateRisikoscenarioModal: FunctionComponent<TProps> = ({
  pvkDokument,
  onSubmitStateUpdate,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isPvoAlertModal, setIsPvoAlertModal] = useState<boolean>(false)

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
                setIsEdit(true)
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
