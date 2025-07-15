import { BodyLong, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import DataTextWrapper from '../../../PvoTilbakemelding/common/DataTextWrapper'
import { Markdown } from '../../../common/Markdown'

type TProps = {
  merknadTilRisikoeier: string
}

export const BeskjedTilRisikoeierReadOnly: FunctionComponent<TProps> = ({
  merknadTilRisikoeier,
}) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Etterleverens kommmentarer til risikoeier</Label>
      <DataTextWrapper>
        <BodyLong className='break-all'>
          {merknadTilRisikoeier ? <Markdown source={merknadTilRisikoeier} /> : 'Ingen beskjed'}
        </BodyLong>
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedTilRisikoeierReadOnly
