import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { BodyLong, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  merknadFraRisikoeier: string
}

export const BeskjedFraRisikoeierReadOnly: FunctionComponent<TProps> = ({
  merknadFraRisikoeier,
}) => {
  return (
    <div className='mt-8 mb-5 max-w-[75ch]'>
      <Heading size='medium' level='2' className='my-5'>
        Godkjent og arkivert PVK
      </Heading>
      <Label>Risikoeiers begrunnelse for godkjenning av restrisiko</Label>
      <DataTextWrapper>
        <BodyLong className='break-all'>
          {merknadFraRisikoeier ? <Markdown source={merknadFraRisikoeier} /> : 'Ingen beskjed'}
        </BodyLong>
      </DataTextWrapper>
    </div>
  )
}
export default BeskjedFraRisikoeierReadOnly
