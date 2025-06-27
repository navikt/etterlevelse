import { BodyLong, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import DataTextWrapper from '../../../PvoTilbakemelding/common/DataTextWrapper'

type TProps = {
  merknadFraRisikoeier: string
}

export const BeskjedFraRisikoeierReadOnly: FunctionComponent<TProps> = ({
  merknadFraRisikoeier,
}) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Risikoeierens kommmentarer</Label>
      <DataTextWrapper>
        <BodyLong className='break-all'>
          {merknadFraRisikoeier ? merknadFraRisikoeier : 'Ingen beskjed'}
        </BodyLong>
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedFraRisikoeierReadOnly
