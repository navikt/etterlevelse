import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TBeskjedFraEtterleverReadOnlyProps = {
  pvkDokument: IPvkDokument
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6'
  headingSize?: 'small' | 'medium' | 'xlarge' | 'large' | 'xsmall'
  innsendingId?: number
}

export const BeskjedFraEtterleverReadOnly: FunctionComponent<
  TBeskjedFraEtterleverReadOnlyProps
> = ({ pvkDokument, headingLevel, headingSize, innsendingId }) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter((melding) => {
    if (innsendingId) {
      return melding.innsendingId === innsendingId
    } else {
      return melding.innsendingId === pvkDokument.antallInnsendingTilPvo
    }
  })

  return (
    <>
      <div className='my-5 max-w-[75ch]'>
        <Label>Beskjed fra etterlever</Label>
        <DataTextWrapper customEmptyMessage='Ingen beskjed'>
          {relevantMeldingTilPvo[0].merknadTilPvo}
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
}
