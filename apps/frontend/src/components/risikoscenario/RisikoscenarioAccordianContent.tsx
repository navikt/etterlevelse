import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Label } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { getRisikoscenario, updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioView from './RisikoscenarioView'
import SlettOvrigRisikoscenario from './SlettOvrigRisikoscenario'
import IngenTiltakField from './edit/IngenTiltakField'
import RisikoscenarioModalForm from './edit/RisikoscenarioModalForm'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  formRef?: RefObject<any>
}

export const RisikoscenarioAccordionContent = (props: IProps) => {
  const { risikoscenario, risikoscenarioer, setRisikoscenarioer, formRef } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
    })
  }

  const submitIngenTiltak = async (submitedValues: IRisikoscenario) => {
    await getRisikoscenario(risikoscenario.id).then((response) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        ingenTiltak: submitedValues.ingenTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response) => {
        setActiveRisikoscenario(response)
        window.location.reload()
      })
    })
  }

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={false} />

      <div className="mt-5 flex gap-2 items-center">
        <Button
          variant="tertiary"
          type="button"
          icon={<PencilIcon aria-hidden />}
          onClick={() => setIsEditModalOpen(true)}
        >
          Redigèr risikoscenario
        </Button>
        <SlettOvrigRisikoscenario
          risikoscenarioId={risikoscenario.id}
          risikoscenarioer={risikoscenarioer}
          setRisikoscenarioer={setRisikoscenarioer}
        />
      </div>

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>

        {!risikoscenario.ingenTiltak && <div>liste over tiltak og redigeringsknappene</div>}

        <div className="mt-3">
          <IngenTiltakField
            risikoscenario={activeRisikoscenario}
            formRef={formRef}
            submit={submitIngenTiltak}
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
