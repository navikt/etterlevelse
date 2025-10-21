import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

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
