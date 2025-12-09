import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { BodyLong, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  merknadTilRisikoeier: string
}

export const BeskjedTilRisikoeierReadOnly: FunctionComponent<TProps> = ({
  merknadTilRisikoeier,
}) => {
  return (
    <div className='mt-8 mb-5 max-w-[75ch]'>
      <div className='mt-5 mb-3'>
        <Label>Hvem skal dere sende PVK-en til?</Label>
        <DataTextWrapper>
          <BodyLong className='break-all'>Risikoeier, til godkjenning</BodyLong>
        </DataTextWrapper>
      </div>

      <Heading size='small' level='3' className='my-5'>
        Sendt til Risikoeier for godkjenning
      </Heading>
      <div className='mt-5 mb-3'>
        <Label>
          Oppsummer for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemeldinger
        </Label>
        <DataTextWrapper>
          <BodyLong className='break-all'>
            {merknadTilRisikoeier ? <Markdown source={merknadTilRisikoeier} /> : 'Ingen beskjed'}
          </BodyLong>
        </DataTextWrapper>
      </div>
    </div>
  )
}
export default BeskjedTilRisikoeierReadOnly
