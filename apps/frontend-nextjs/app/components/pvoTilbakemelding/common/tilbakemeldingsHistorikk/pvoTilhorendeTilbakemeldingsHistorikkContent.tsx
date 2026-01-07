import { Markdown } from '@/components/common/markdown/markdown'
import { ITilhorendeDokumentasjonTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { BodyLong, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EBidragVerdier, bidragsVerdierToText } from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  tilbakemeldingsinnhold: ITilhorendeDokumentasjonTilbakemelding
  forPvo?: boolean
}

export const PvoTilhorendeTilbakemeldingsHistorikkContent: FunctionComponent<TProps> = ({
  tilbakemeldingsinnhold,

  forPvo,
}) => (
  <div>
    <div>
      <Heading level='4' size='small' className='my-5'>
        Behandlinger i Behandlingskatalogen
      </Heading>

      {forPvo && (
        <div className='my-5'>
          <Heading level='5' size='xsmall' className='mt-7 mb-5'>
            Intern PVO-notater
          </Heading>
          {tilbakemeldingsinnhold &&
            tilbakemeldingsinnhold.behandlingsInternDiskusjon &&
            tilbakemeldingsinnhold.behandlingsInternDiskusjon.length !== 0 && (
              <Markdown
                source={tilbakemeldingsinnhold.behandlingsInternDiskusjon}
                escapeHtml={false}
              />
            )}
          <BodyLong>
            {(!tilbakemeldingsinnhold ||
              !tilbakemeldingsinnhold.behandlingsInternDiskusjon ||
              tilbakemeldingsinnhold.behandlingsInternDiskusjon.length === 0) &&
              'Ingen intern diskusjon'}
          </BodyLong>
        </div>
      )}

      <Heading level='5' size='xsmall' className='mt-7 mb-5'>
        Gi tilbakemelding
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

    <div className='h-0.5  w-full border-2 my-7' />

    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        PVK-relaterte etterlevelseskrav
      </Heading>

      {forPvo && (
        <div className='my-5'>
          <Heading level='5' size='xsmall' className='mt-7 mb-5'>
            Intern PVO-notater
          </Heading>
          {tilbakemeldingsinnhold &&
            tilbakemeldingsinnhold.kravInternDiskusjon &&
            tilbakemeldingsinnhold.kravInternDiskusjon.length !== 0 && (
              <Markdown source={tilbakemeldingsinnhold.kravInternDiskusjon} escapeHtml={false} />
            )}
          <BodyLong>
            {(!tilbakemeldingsinnhold ||
              !tilbakemeldingsinnhold.kravInternDiskusjon ||
              tilbakemeldingsinnhold.kravInternDiskusjon.length === 0) &&
              'Ingen intern diskusjon'}
          </BodyLong>
        </div>
      )}

      <Heading level='5' size='xsmall' className='mt-7 mb-5'>
        Gi tilbakemelding
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

    <div className='h-0.5  w-full border-2 my-7' />

    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        Risiko- og sårbarhetsvurdering (ROS)
      </Heading>

      {forPvo && (
        <div className='my-5'>
          <Heading level='5' size='xsmall' className='mt-7 mb-5'>
            Intern PVO-notater
          </Heading>
          {tilbakemeldingsinnhold &&
            tilbakemeldingsinnhold.risikovurderingInternDiskusjon &&
            tilbakemeldingsinnhold.risikovurderingInternDiskusjon.length !== 0 && (
              <Markdown
                source={tilbakemeldingsinnhold.risikovurderingInternDiskusjon}
                escapeHtml={false}
              />
            )}
          <BodyLong>
            {(!tilbakemeldingsinnhold ||
              !tilbakemeldingsinnhold.risikovurderingInternDiskusjon ||
              tilbakemeldingsinnhold.risikovurderingInternDiskusjon.length === 0) &&
              'Ingen intern diskusjon'}
          </BodyLong>
        </div>
      )}

      <Heading level='5' size='xsmall' className='mt-7 mb-5'>
        Gi tilbakemelding
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

export default PvoTilhorendeTilbakemeldingsHistorikkContent
