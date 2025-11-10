import { Markdown } from '@/components/common/markdown/markdown'
import { ITilhorendeDokumentasjonTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { EBidragVerdier, bidragsVerdierToText } from './pvoTilbakemeldingReadOnly'

type TProps = {
  tilbakemeldingsinnhold: ITilhorendeDokumentasjonTilbakemelding
  sentDate: string
  forPvo?: boolean
  noHeader?: boolean
}

export const TilhorendeDokumentasjonTilbakemeldingReadOnly: FunctionComponent<TProps> = ({
  tilbakemeldingsinnhold,
  sentDate,
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
        Tilbakemeldingsdato: {moment(sentDate).format('LL')}
      </BodyShort>
    )}

    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        Behandlinger i Behandlingskatalogen
      </Heading>

      <Label>Vurdering om dokumentasjon i Behandlingskatalogen er tilstrekkelig.</Label>
      <BodyLong>
        {!tilbakemeldingsinnhold && 'Ikke vurdert'}
        {tilbakemeldingsinnhold &&
          bidragsVerdierToText(
            tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilstrekkelig as EBidragVerdier
          )}
      </BodyLong>

      <div className='my-5'>
        <Label>Tilbakemelding</Label>
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilbakemelding &&
          tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilbakemelding.length !== 0 && (
            <Markdown
              source={tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilbakemelding}
            />
          )}
        <BodyLong>
          {(!tilbakemeldingsinnhold ||
            !tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilbakemelding ||
            tilbakemeldingsinnhold.behandlingskatalogDokumentasjonTilbakemelding.length === 0) &&
            'Ingen tilbakemelding'}
        </BodyLong>
      </div>
    </div>

    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        PVK-relaterte etterlevelseskrav
      </Heading>

      <Label>Vurdering om kravdokumentasjon er tilstrekkelig.</Label>
      <BodyLong>
        {!tilbakemeldingsinnhold && 'Ikke vurdert'}
        {tilbakemeldingsinnhold &&
          bidragsVerdierToText(
            tilbakemeldingsinnhold.kravDokumentasjonTilstrekkelig as EBidragVerdier
          )}
      </BodyLong>

      <div className='my-5'>
        <Label>Tilbakemelding</Label>
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.kravDokumentasjonTilbakemelding &&
          tilbakemeldingsinnhold.kravDokumentasjonTilbakemelding.length !== 0 && (
            <Markdown source={tilbakemeldingsinnhold.kravDokumentasjonTilbakemelding} />
          )}
        <BodyLong>
          {(!tilbakemeldingsinnhold ||
            !tilbakemeldingsinnhold.kravDokumentasjonTilbakemelding ||
            tilbakemeldingsinnhold.kravDokumentasjonTilbakemelding.length === 0) &&
            'Ingen tilbakemelding'}
        </BodyLong>
      </div>
    </div>

    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        Risiko- og sårbarhetsvurdering (ROS)
      </Heading>

      <Label>Vurdering om risikovurderingen(e) er tilstrekkelig.</Label>
      <BodyLong>
        {!tilbakemeldingsinnhold && 'Ikke vurdert'}
        {tilbakemeldingsinnhold &&
          bidragsVerdierToText(
            tilbakemeldingsinnhold.risikovurderingTilstrekkelig as EBidragVerdier
          )}
      </BodyLong>

      <div className='my-5'>
        <Label>Tilbakemelding</Label>
        {tilbakemeldingsinnhold &&
          tilbakemeldingsinnhold.risikovurderingTilbakemelding &&
          tilbakemeldingsinnhold.risikovurderingTilbakemelding.length !== 0 && (
            <Markdown source={tilbakemeldingsinnhold.risikovurderingTilbakemelding} />
          )}
        <BodyLong>
          {(!tilbakemeldingsinnhold ||
            !tilbakemeldingsinnhold.risikovurderingTilbakemelding ||
            tilbakemeldingsinnhold.risikovurderingTilbakemelding.length === 0) &&
            'Ingen tilbakemelding'}
        </BodyLong>
      </div>
    </div>
  </div>
)

export default TilhorendeDokumentasjonTilbakemeldingReadOnly
