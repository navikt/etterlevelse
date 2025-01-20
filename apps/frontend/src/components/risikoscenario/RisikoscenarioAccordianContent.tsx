import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Label } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioView from './RisikoscenarioView'
import SlettOvrigRisikoscenario from './SlettOvrigRisikoscenario'
import IngenTiltakField from './edit/IngenTiltakField'
import RisikoscenarioModalForm from './edit/RisikoscenarioModalForm'

interface IProps {
  risikoscenario: IRisikoscenario
  formRef?: RefObject<any>
  risikoscenarioer?: IRisikoscenario[]
  setRisikoscenarioer?: (state: IRisikoscenario[]) => void
  kravnummer?: number
  isCreateMode?: boolean
  noCopyButton?: boolean
}

export const RisikoscenarioAccordionContent = (props: IProps) => {
  const {
    risikoscenario,
    risikoscenarioer,
    setRisikoscenarioer,
    isCreateMode,
    kravnummer,
    noCopyButton,
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
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={noCopyButton} />

      {!isCreateMode && (
        <div className="mt-5 flex gap-2 items-center">
          <Button
            variant="tertiary"
            type="button"
            icon={<PencilIcon aria-hidden />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Redigèr risikoscenario
          </Button>

          {!kravnummer && (
            <SlettOvrigRisikoscenario
              risikoscenarioId={risikoscenario.id}
              risikoscenarioer={risikoscenarioer}
              setRisikoscenarioer={setRisikoscenarioer}
            />
          )}
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
export default RisikoscenarioAccordionContent
