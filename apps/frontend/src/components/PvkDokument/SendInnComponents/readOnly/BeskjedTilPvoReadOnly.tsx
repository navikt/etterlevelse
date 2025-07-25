import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IPvkDokument } from '../../../../constants'
import DataTextWrapper from '../../../PvoTilbakemelding/common/DataTextWrapper'
import { Markdown } from '../../../common/Markdown'

type TProps = {
  pvkDokument: IPvkDokument
}

export const BeskjedTilPvoReadOnly: FunctionComponent<TProps> = ({ pvkDokument }) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Beskjed til personvernombudet</Label>
      <DataTextWrapper>
        {pvkDokument.merknadTilPvoEllerRisikoeier ? (
          <Markdown source={pvkDokument.merknadTilPvoEllerRisikoeier} />
        ) : (
          'Ingen beskjed'
        )}
      </DataTextWrapper>
    </div>
  )
}

export default BeskjedTilPvoReadOnly
