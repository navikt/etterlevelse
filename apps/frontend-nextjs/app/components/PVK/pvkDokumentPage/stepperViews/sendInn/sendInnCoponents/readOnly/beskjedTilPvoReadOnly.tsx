import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { IMeldingTilPvo } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  meldingTilPvo: IMeldingTilPvo
}

export const BeskjedTilPvoReadOnly: FunctionComponent<TProps> = ({ meldingTilPvo }) => {
  return (
    <div className='mt-5 mb-3 max-w-[75ch]'>
      <Label>Beskjed til personvernombudet</Label>
      <DataTextWrapper>
        {meldingTilPvo.merknadTilPvo ? (
          <Markdown source={meldingTilPvo.merknadTilPvo} />
        ) : (
          'Ingen beskjed'
        )}
      </DataTextWrapper>
    </div>
  )
}

export default BeskjedTilPvoReadOnly
