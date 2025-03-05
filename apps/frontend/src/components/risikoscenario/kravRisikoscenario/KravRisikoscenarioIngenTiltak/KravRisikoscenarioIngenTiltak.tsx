import { BodyLong } from '@navikt/ds-react'
import { IRisikoscenario } from '../../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
}

export const KravRisikoscenarioIngenTiltak = ({ risikoscenario }: IProps) => (
  <div className="mt-3">
    {!risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak</BodyLong>}
  </div>
)

export default KravRisikoscenarioIngenTiltak
