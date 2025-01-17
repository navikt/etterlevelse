import { BodyLong, Label } from '@navikt/ds-react'
import { useState } from 'react'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioView from './RisikoscenarioView'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
}

export const OppsumeringAccordianContent = (props: IProps) => {
  const { risikoscenario } = props
  const [activeRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const currentUrl = window.location.origin.toString() + window.location.pathname + '?steg=4'
  const tiltakListe = ['testTiltak']

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} currentUrl={currentUrl} />

      <div className="mt-5">
        <Label>Følgende tiltak gjelder for dette risikoscenarioet</Label>

        {!risikoscenario.ingenTiltak && tiltakListe.length !== 0 && (
          <div>
            <BodyLong>liste over tiltak og redigeringsknappene</BodyLong>
            <div>{/* component for å revurdere sannsynlighets-/konsekvensnivaa */}</div>
          </div>
        )}
        {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}
      </div>
    </div>
  )
}
export default OppsumeringAccordianContent
