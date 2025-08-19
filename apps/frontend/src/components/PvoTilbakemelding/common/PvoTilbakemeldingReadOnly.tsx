import { BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { ITilbakemeldingsinnhold } from '../../../constants'
import { Markdown } from '../../common/Markdown'

enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

type TProps = {
  tilbakemeldingsinnhold: ITilbakemeldingsinnhold
  sentDate: string
  forPvo?: boolean
}

export const PvoTilbakemeldingReadOnly: FunctionComponent<TProps> = ({
  tilbakemeldingsinnhold,
  sentDate,
  forPvo,
}) => (
  <div>
    <Heading level='2' size='small' className='mb-5'>
      Tilbakemelding fra personvernombudet
    </Heading>

    {forPvo && (
      <div>
        <Label>intern PVO-notater</Label>
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.internDiskusjon &&
          tilbakemeldingsinnhold.internDiskusjon.length !== 0 && (
            <Markdown source={tilbakemeldingsinnhold.internDiskusjon} escapeHtml={false} />
          )}
        <BodyLong>
          {(!tilbakemeldingsinnhold ||
            !tilbakemeldingsinnhold.internDiskusjon ||
            tilbakemeldingsinnhold.internDiskusjon.length === 0) &&
            'Ingen intern diskusjon'}
        </BodyLong>

        <div className='h-0.5  w-full border-2 my-7' />
      </div>
    )}

    {sentDate && sentDate.length !== 0 && (
      <BodyShort size='medium' className='pb-5'>
        Tilbakemeldings dato: {moment(sentDate).format('LL')}
      </BodyShort>
    )}

    <div>
      <Label>Vurdéring av etterleverens svar.</Label>
      <BodyLong>
        {!tilbakemeldingsinnhold && 'Ikke vurdert'}
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.bidragsVurdering === EBidragVerdier.TILSTREKKELIG &&
          'Ja, tilstrekkelig'}
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.bidragsVurdering === EBidragVerdier.TILSTREKKELIG_FORBEHOLDT &&
          'Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives i fritekst under'}
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.bidragsVurdering === EBidragVerdier.UTILSTREKKELIG &&
          'Utilstrekkelig, beskrives nærmere under'}
      </BodyLong>
    </div>

    <div className='my-5'>
      <Label>Tilbakemelding</Label>
      {tilbakemeldingsinnhold &&
        tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere &&
        tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere.length !== 0 && (
          <Markdown source={tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere} />
        )}
      <BodyLong>
        {(!tilbakemeldingsinnhold ||
          !tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere ||
          tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere.length === 0) &&
          'Ingen tilbakemelding'}
      </BodyLong>
    </div>
  </div>
)

export default PvoTilbakemeldingReadOnly
