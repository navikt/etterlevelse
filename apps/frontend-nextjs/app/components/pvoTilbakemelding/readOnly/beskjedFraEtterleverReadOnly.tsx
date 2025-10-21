import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = { pvkDokument: IPvkDokument }

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ pvkDokument }) => (
  <>
    <div className='my-5 max-w-[75ch]'>
      <Label>Beskjed fra etterlever</Label>
      <DataTextWrapper customEmptyMessage='Ingen beskjed'>
        {pvkDokument.merknadTilPvoEllerRisikoeier}
      </DataTextWrapper>
    </div>

    <Heading level='1' size='medium' className='mb-5'>
      Tilbakemelding til etterlever
    </Heading>
  </>
)
