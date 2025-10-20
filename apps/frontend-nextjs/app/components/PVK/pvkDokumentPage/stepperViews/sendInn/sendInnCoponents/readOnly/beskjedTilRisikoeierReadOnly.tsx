import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { BodyLong, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

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
