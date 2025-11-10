import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = {
  pvkDokument: IPvkDokument
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6'
  headingSize?: 'small' | 'medium' | 'xlarge' | 'large' | 'xsmall'
}

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ pvkDokument, headingLevel, headingSize }) => (
  <>
    <div className='my-5 max-w-[75ch]'>
      <Label>Beskjed fra etterlever</Label>
      <DataTextWrapper customEmptyMessage='Ingen beskjed'>
        {pvkDokument.merknadTilPvoEllerRisikoeier}
      </DataTextWrapper>
    </div>

    <Heading
      level={headingLevel ? headingLevel : '1'}
      size={headingSize ? headingSize : 'medium'}
      className='mb-5'
    >
      Tilbakemelding til etterlever
    </Heading>
  </>
)
