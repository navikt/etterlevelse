import { Label } from '@navikt/ds-react'
import { Dispatch, SetStateAction } from 'react'
import { IRisikoscenario, TKravQL } from '../../../constants'
import RisikoscenarioForm from './RisikoscenarioForm'

interface IProps {
  krav: TKravQL
  pvkDokumentId: string
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: Dispatch<SetStateAction<IRisikoscenario[]>>
  setIsCreateMode: (state: boolean) => void
}

export const CreateRisikoscenario = (props: IProps) => {
  const { krav, pvkDokumentId, setIsCreateMode, risikoscenarioer, setRisikoscenarioer } = props

  const submit = async (risikoscenario: IRisikoscenario) => {
    //logic for å lagre i backend og oppdatere liste i parent komponent
    console.debug(risikoscenario)
    //ferdig med submit, oppdaterer list og lukker create mode
    setRisikoscenarioer([...risikoscenarioer, risikoscenario])
    setIsCreateMode(false)
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
      />
    </div>
  )
}

export default CreateRisikoscenario
