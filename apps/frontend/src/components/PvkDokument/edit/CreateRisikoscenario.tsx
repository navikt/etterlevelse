import { Button } from '@navikt/ds-react'
import { useState } from 'react'
import { createRiskoscenario } from '../../../api/RisikoscenarioApi'
import { IPvkDokument, IRisikoscenario } from '../../../constants'
import RisikoscenarioModalForm from './RisikoscenarioModalForm'

interface IProps {
  pvkDokument: IPvkDokument
  onSubmitStateUpdate?: (risikoscenario: IRisikoscenario) => void
}

export const CreateRisikoscenario = (props: IProps) => {
  const { pvkDokument, onSubmitStateUpdate } = props
  const [isEdit, setIsEdit] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario) => {
    await createRiskoscenario(risikoscenario).then((response) => {
      if (onSubmitStateUpdate) {
        onSubmitStateUpdate(response)
      }
      setIsEdit(false)
    })
  }

  return (
    <div className="mt-5">
      {!isEdit && (
        <Button onClick={() => setIsEdit(true)} variant="secondary">
          Opprett nytt øvrig risikoscenario
        </Button>
      )}

      {isEdit && (
        <RisikoscenarioModalForm
          headerText="Opprett nytt øvirg risikoscenario"
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

export default CreateRisikoscenario
