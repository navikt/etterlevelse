import { Heading } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, RefObject, SetStateAction } from 'react'
import { createRisikoscenarioKnyttetTilKrav } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario, TKravQL } from '../../../constants'
import RisikoscenarioForm from './RisikoscenarioForm'

type TProps = {
  krav: TKravQL
  pvkDokumentId: string
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: Dispatch<SetStateAction<IRisikoscenario[]>>
  setIsCreateMode: (state: boolean) => void
  setActiveRisikoscenarioId: (state: string) => void
  formRef: RefObject<any>
}

export const CreateRisikoscenario: FunctionComponent<TProps> = ({
  krav,
  pvkDokumentId,
  setIsCreateMode,
  risikoscenarioer,
  setRisikoscenarioer,
  setActiveRisikoscenarioId,
  formRef,
}) => {
  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await createRisikoscenarioKnyttetTilKrav(krav.kravNummer, risikoscenario).then((response) => {
      setRisikoscenarioer([...risikoscenarioer, response])
      setActiveRisikoscenarioId(response.id)

      setTimeout(() => {
        const element = document.getElementById(response.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)

      setIsCreateMode(false)
    })
  }

  return (
    <div className='w-full'>
      <Heading size='medium' level='2' className='mb-5'>
        Legg til nytt risikoscenario
      </Heading>
      <RisikoscenarioForm
        onClose={() => setIsCreateMode(false)}
        submit={submit}
        initialValues={{
          pvkDokumentId: pvkDokumentId,
          generelScenario: false,
          relevanteKravNummer: [
            {
              kravNummer: krav.kravNummer,
              kravVersjon: krav.kravVersjon,
              navn: krav.navn,
              temaCode: krav.regelverk[0].lov.data?.tema || '',
            },
          ],
        }}
        formRef={formRef}
      />
    </div>
  )
}

export default CreateRisikoscenario
