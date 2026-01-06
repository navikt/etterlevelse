import { Markdown } from '@/components/common/markdown/markdown'
import { ITilbakemeldingsinnhold } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { BodyLong, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { bidragsVerdierToText } from '../../readOnly/pvoTilbakemeldingReadOnly'

export enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

type TProps = {
  tilbakemeldingsinnhold: ITilbakemeldingsinnhold
  forPvo?: boolean
  noHeader?: boolean
}

export const TilbakemeldingsHistorikkContent: FunctionComponent<TProps> = ({
  tilbakemeldingsinnhold,
  forPvo,
  noHeader,
}) => (
  <div>
    {!noHeader && (
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemelding fra personvernombudet
      </Heading>
    )}

    {forPvo && (
      <div className='w-full'>
        <Heading level='2' size='small'>
          intern PVO-notater
        </Heading>
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
      </div>
    )}

    <Heading level='2' size='small' className='mb-5 mt-7'>
      Gi tilbakemelding
    </Heading>

    <div className='w-full'>
      <Label>Vurdering av etterleverens svar.</Label>
      <BodyLong>
        {!tilbakemeldingsinnhold && 'Ikke vurdert'}
        {tilbakemeldingsinnhold &&
          bidragsVerdierToText(tilbakemeldingsinnhold.bidragsVurdering as EBidragVerdier)}
      </BodyLong>
    </div>

    <div className='my-5 w-full'>
      <Label>Tilbakemelding</Label>
      {tilbakemeldingsinnhold &&
        tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere &&
        tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere.length !== 0 && (
          <Markdown
            source={tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere}
            escapeHtml={false}
          />
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

export default TilbakemeldingsHistorikkContent
