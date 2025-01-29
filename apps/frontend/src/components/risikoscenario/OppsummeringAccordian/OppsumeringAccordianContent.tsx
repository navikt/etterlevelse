import { Alert, BodyLong, Label } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { IRisikoscenario, ITiltak } from '../../../constants'
import RisikoscenarioView from '../RisikoscenarioView'
import VurdereTiltaksEffekt from '../edit/VurdereTiltaksEffekt'

interface IProps {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  formRef: RefObject<any>
}

export const OppsumeringAccordianContent = (props: IProps) => {
  const { risikoscenario, tiltakList, formRef } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} />

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>
        {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

        {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
          <div>
            {tiltakList
              .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
              .map((tiltak) => (
                <BodyLong key={tiltak.id}>{tiltak.navn}</BodyLong>
              ))}
          </div>
        )}

        {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
          <div>
            <Alert className="mt-3" variant="warning">
              Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
            </Alert>
          </div>
        )}

        {!risikoscenario.ingenTiltak && (
          <div>
            {risikoscenario.tiltakIds.length !== 0 && (
              <div>
                <VurdereTiltaksEffekt
                  risikoscenario={activeRisikoscenario}
                  setRisikoscenario={setActiveRisikoscenario}
                  formRef={formRef}
                />
              </div>
            )}

            {risikoscenario.tiltakIds.length === 0 && (
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
