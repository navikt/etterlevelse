import { Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { createRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IPvkDokument, IRisikoscenario } from '../../../constants'
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

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await createRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      if (onSubmitStateUpdate) {
        onSubmitStateUpdate(response)
      }
      setIsEdit(false)
      navigate(`${window.location.pathname}?risikoscenario=${response.id}`)
    })
  }

  return (
    <div className='mt-5'>
      {!isEdit && (
        <Button onClick={() => setIsEdit(true)} variant='secondary'>
          Opprett nytt øvrig risikoscenario
        </Button>
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
