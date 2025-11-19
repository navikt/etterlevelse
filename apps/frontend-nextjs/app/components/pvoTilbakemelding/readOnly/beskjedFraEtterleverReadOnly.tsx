import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IMeldingTilPvo } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = {
  meldingTilPvo: IMeldingTilPvo
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6'
  headingSize?: 'small' | 'medium' | 'xlarge' | 'large' | 'xsmall'
}

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ meldingTilPvo, headingLevel, headingSize }) => (
  <>
    <div className='my-5 max-w-[75ch]'>
      <Label>Beskjed fra etterlever</Label>
      <DataTextWrapper customEmptyMessage='Ingen beskjed'>
        {meldingTilPvo.merknadTilPvo}
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
