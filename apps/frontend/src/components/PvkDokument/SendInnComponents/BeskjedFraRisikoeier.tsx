import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import DataTextWrapper from '../../PvoTilbakemelding/common/DataTextWrapper'

type TProps = {
  merknadFraRisikoeier: string
}

export const BeskjedFraRisikoeier: FunctionComponent<TProps> = ({ merknadFraRisikoeier }) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Risikoeierens kommmentarer</Label>
      <DataTextWrapper>
        {merknadFraRisikoeier ? merknadFraRisikoeier : 'Ingen beskjed'}
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedFraRisikoeier
