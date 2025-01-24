import { Label } from '@navikt/ds-react'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { createRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario, TKravQL } from '../../../constants'
import RisikoscenarioForm from './RisikoscenarioForm'

interface IProps {
  krav: TKravQL
  pvkDokumentId: string
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: Dispatch<SetStateAction<IRisikoscenario[]>>
  setIsCreateMode: (state: boolean) => void
  formRef: RefObject<any>
}

export const CreateRisikoscenario = (props: IProps) => {
  const { krav, pvkDokumentId, setIsCreateMode, risikoscenarioer, setRisikoscenarioer, formRef } =
    props

  const submit = async (risikoscenario: IRisikoscenario) => {
    await createRisikoscenario(risikoscenario).then((response) => {
      setRisikoscenarioer([...risikoscenarioer, response])
      setIsCreateMode(false)
    })
  }

  return (
    <div className="w-full">
      <Label>Legg til nytt risikoscenario</Label>
      <RisikoscenarioForm
        onClose={() => setIsCreateMode(false)}
        submit={submit}
        initialValues={{
          pvkDokumentId: pvkDokumentId,
          generelScenario: false,
          kravToAdd: [krav.kravNummer],
          relevanteKravNummer: [
            { kravNummer: krav.kravNummer, kravVersjon: krav.kravVersjon, navn: krav.navn },
          ],
        }}
        formRef={formRef}
      />
    </div>
  )
}

export default CreateRisikoscenario
