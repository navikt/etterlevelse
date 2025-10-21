import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { BodyLong, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

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
          {merknadFraRisikoeier ? <Markdown source={merknadFraRisikoeier} /> : 'Ingen beskjed'}
        </BodyLong>
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedFraRisikoeierReadOnly
