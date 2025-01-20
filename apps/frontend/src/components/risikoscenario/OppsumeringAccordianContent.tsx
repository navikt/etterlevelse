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

  const tiltakListe = []

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} />

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>
        {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

        {!risikoscenario.ingenTiltak && tiltakListe.length === 0 && (
          <div>
            <Alert className="mt-3" variant="warning">
              Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
            </Alert>
          </div>
        )}

        {!risikoscenario.ingenTiltak && (
          <div>
            <div className="mt-5">
              <Label>Antatt risikonivå etter gjennomførte tiltak</Label>
            </div>

            {tiltakListe.length !== 0 && (
              <div>
                <BodyLong>liste over tiltak og redigeringsknappene</BodyLong>

                <VurdereTiltaksEffekt
                  risikoscenario={activeRisikoscenario}
                  setRisikoscenario={setActiveRisikoscenario}
                />
              </div>
            )}

            {tiltakListe.length === 0 && (
              <Alert className="mt-3" variant="warning">
                Før dere kan vurdere tiltakenes effekt, må dere legge inn tiltak under
                Identifisering av risikoscenarioer og tiltak.
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default OppsumeringAccordianContent
