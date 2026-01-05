import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { Markdown } from '@/components/common/markdown/markdown'
import { IMeldingTilPvo } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { BodyLong, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  meldingTilPvo: IMeldingTilPvo
}

export const BeskjedTilPvoReadOnly: FunctionComponent<TProps> = ({ meldingTilPvo }) => {
  const nyRunde = meldingTilPvo.innsendingId > 1 ? 'ny ' : ''

  return (
    <div className='mt-8 mb-5 max-w-[75ch]'>
      <div className='mt-5 mb-3'>
        <Label>Hvem skal dere sende PVK-en til?</Label>
        <DataTextWrapper>
          <BodyLong className='break-all'>PVO, til {nyRunde}vurdering</BodyLong>
        </DataTextWrapper>
      </div>

      <Heading size='small' level='3' className='my-5'>
        Sendt PVK til {nyRunde}vurdering
      </Heading>
      <div className='mt-5 mb-3'>
        <Label>Forklar hvorfor dere ønsker å sende inn til {nyRunde}vurdering</Label>
        <DataTextWrapper>
          {meldingTilPvo.merknadTilPvo ? (
            <Markdown source={meldingTilPvo.merknadTilPvo} />
          ) : (
            'Ingen beskjed'
          )}
        </DataTextWrapper>
      </div>
      <div className='mt-5 mb-3'>
        <Label>Oppsummer hvilke endringer som er gjort siden siste tilbakemelding fra PVO.</Label>
        <DataTextWrapper>
          {meldingTilPvo.endringsNotat ? (
            <Markdown source={meldingTilPvo.endringsNotat} />
          ) : (
            'Ingen beskjed'
          )}
        </DataTextWrapper>
      </div>
    </div>
  )
}

export default BeskjedTilPvoReadOnly
