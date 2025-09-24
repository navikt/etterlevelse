import { Heading } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, RefObject, SetStateAction, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRisikoscenarioKnyttetTilKrav } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario, TKravQL } from '../../../constants'
import { risikoscenarioUrl } from '../../common/RouteLinkPvk'
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
  const navigate = useNavigate()

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await createRisikoscenarioKnyttetTilKrav(krav.kravNummer, risikoscenario).then((response) => {
      setRisikoscenarioer([...risikoscenarioer, response])
      setActiveRisikoscenarioId(response.id)
      navigate(risikoscenarioUrl(response.id))

      setTimeout(() => {
        const element = document.getElementById(response.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)

      setIsCreateMode(false)
    })
  }

  useEffect(() => {
    const risikoscenarioForm = document.getElementById('createRisikoscenarioForm')
    if (risikoscenarioForm) {
      risikoscenarioForm.scrollIntoView()
    }
  }, [])

  return (
    <div className='w-full'>
      <Heading size='medium' level='2' className='mb-5' id='createRisikoscenarioForm'>
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
