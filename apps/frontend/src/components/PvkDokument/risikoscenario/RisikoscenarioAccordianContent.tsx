import { LinkIcon, PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, CopyButton } from '@navikt/ds-react'
import { useState } from 'react'
import { updateRiskoscenario } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import RisikoscenarioModalForm from '../edit/RisikoscenarioModalForm'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from './RisikoscenarioTag'

interface IProps {
  risikoscenario: IRisikoscenario
  noCopyButton?: boolean
}

export const RisikoscenarioAccordionContent = (props: IProps) => {
  const { risikoscenario, noCopyButton } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const currentUrl = window.location.origin.toString() + window.location.pathname + '?steg=4'

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRiskoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
    })
  }

  return (
    <div>
      {!noCopyButton && (
        <CopyButton
          variant="action"
          copyText={currentUrl + '#' + activeRisikoscenario.id}
          text="Kopiér scenariolenke"
          activeText="Lenken er kopiert"
          icon={<LinkIcon aria-hidden />}
        />
      )}
      <BodyLong className="mt-5">{activeRisikoscenario.beskrivelse}</BodyLong>
      <BodyLong className="mt-5">
        Dette risikoscenarioet er ikke tilknyttet spesifikke etterlevelseskrav.
      </BodyLong>

      <div className="mt-5">
        <RisikoscenarioTag
          level={activeRisikoscenario.sannsynlighetsNivaa}
          text={getSannsynlighetsnivaaText(activeRisikoscenario.sannsynlighetsNivaa)}
        />
      </div>

      {!activeRisikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className="mt-5">Ingen begrunnelse skrevet for sannsylighetsnivå</BodyLong>
      )}
      {activeRisikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className="mt-5">{activeRisikoscenario.sannsynlighetsNivaaBegrunnelse}</BodyLong>
      )}

      <div className="mt-5">
        <RisikoscenarioTag
          level={activeRisikoscenario.konsekvensNivaa}
          text={getKonsekvenssnivaaText(activeRisikoscenario.konsekvensNivaa)}
        />
      </div>

      {!activeRisikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className="mt-5">Ingen begrunnelse skrevet for konsekvensnivå</BodyLong>
      )}
      {activeRisikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className="mt-5">{activeRisikoscenario.konsekvensNivaaBegrunnelse}</BodyLong>
      )}

      <Button
        className="mt-5"
        variant="tertiary"
        type="button"
        icon={<PencilIcon aria-hidden />}
        onClick={() => setIsEditModalOpen(true)}
      >
        Redigèr risikoscenario
      </Button>

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
