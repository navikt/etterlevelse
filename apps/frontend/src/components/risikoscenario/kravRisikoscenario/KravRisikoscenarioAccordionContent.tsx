import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Label } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { updateRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import RisikoscenarioView from '../RisikoscenarioView'
import FjernRisikoscenarioFraKrav from '../edit/FjernRisikoscenarioFraKrav'
import IngenTiltakField from '../edit/IngenTiltakField'
import RisikoscenarioModalForm from '../edit/RisikoscenarioModalForm'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  kravnummer: number
  isCreateMode?: boolean
  noCopyButton?: boolean
  formRef?: RefObject<any>
}

export const KravRisikoscenarioAccordionContent = (props: IProps) => {
  const {
    risikoscenario,
    risikoscenarioer,
    risikoscenarioForKrav,
    kravnummer,
    setRisikoscenarioer,
    setRisikoscenarioForKrav,
    isCreateMode,
    formRef,
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
    })
  }

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={true} />

      {!isCreateMode && (
        <div className="mt-5">
          <Button
            variant="tertiary"
            type="button"
            icon={<PencilIcon aria-hidden />}
            onClick={() => setIsEditModalOpen(true)}
            className="mb-2"
          >
            Redigèr risikoscenario
          </Button>

          <FjernRisikoscenarioFraKrav
            kravnummer={kravnummer}
            risikoscenario={risikoscenario}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            risikoscenarioForKrav={risikoscenarioForKrav}
            setRisikoscenarioForKrav={setRisikoscenarioForKrav}
          />
        </div>
      )}

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>

        {!risikoscenario.ingenTiltak && <div>liste over tiltak og redigeringsknappene</div>}

        <div className="mt-3">
          <IngenTiltakField
            risikoscenario={activeRisikoscenario}
            setRisikoscenario={setActiveRisikoscenario}
            formRef={formRef}
          />
        </div>
      </div>

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText="Redigér øvirg risikoscenario"
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
      )}
    </div>
  )
}
export default KravRisikoscenarioAccordionContent
