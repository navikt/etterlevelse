import { LinkIcon, PencilIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, CopyButton, Label } from '@navikt/ds-react'
import { useState } from 'react'
import { updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioModalForm from '../PvkDokument/edit/RisikoscenarioModalForm'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from './RisikoscenarioTag'
import SlettOvrigRisikoscenario from './SlettOvrigRisikoscenario'
import IngenTiltakField from './edit/IngenTiltakField'

interface IProps {
  risikoscenario: IRisikoscenario
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
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const currentUrl = window.location.origin.toString() + window.location.pathname + '?steg=4'

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
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