import { BodyLong } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IRisikoscenario } from '../../../../constants'

type TProps = {
  risikoscenario: IRisikoscenario
}

export const KravRisikoscenarioIngenTiltak: FunctionComponent<TProps> = ({ risikoscenario }) => (
  <div className='mt-3'>
    {!risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak</BodyLong>}
  </div>
)

export default KravRisikoscenarioIngenTiltak
