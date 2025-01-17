import { Alert, BodyLong, Label } from '@navikt/ds-react'
import { useState } from 'react'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioView from './RisikoscenarioView'
import VurdereTiltaksEffekt from './edit/VurdereTiltaksEffekt'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
}

export const OppsumeringAccordianContent = (props: IProps) => {
  const { risikoscenario } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const currentUrl = window.location.origin.toString() + window.location.pathname + '?steg=4'
  const revurdertEffektCheck =
    activeRisikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
    activeRisikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
    activeRisikoscenario.konsekvensNivaaEtterTiltak === 0 ||
    activeRisikoscenario.konsekvensNivaaEtterTiltak === null

  const tiltakListe = ['testTiltak']

  console.debug(activeRisikoscenario.sannsynlighetsNivaaEtterTiltak)
  console.debug(activeRisikoscenario.konsekvensNivaaEtterTiltak)

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} currentUrl={currentUrl} />

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>
        {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

        {!risikoscenario.ingenTiltak && tiltakListe.length !== 0 && (
          <div>
            <BodyLong>liste over tiltak og redigeringsknappene</BodyLong>

            <div className="mt-5">
              <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

              {revurdertEffektCheck && (
                <Alert className="mt-3" variant="warning">
                  Du må vurdere tiltakenes effekt
                </Alert>
              )}

              <div className="mt-3">
                <VurdereTiltaksEffekt
                  risikoscenario={activeRisikoscenario}
                  setRisikoscenario={setActiveRisikoscenario}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default OppsumeringAccordianContent
