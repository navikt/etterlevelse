import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import DataTextWrapper from '../../PvoTilbakemelding/common/DataTextWrapper'

type TProps = {
  merknadTilRisikoeier: string
}

export const BeskjedTilRisikoeier: FunctionComponent<TProps> = ({ merknadTilRisikoeier }) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Etterleverens kommmentarer til risikoeier</Label>
      <DataTextWrapper>
        {merknadTilRisikoeier ? merknadTilRisikoeier : 'Ingen beskjed'}
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedTilRisikoeier
