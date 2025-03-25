import { BodyLong, BodyShort, Heading, Label } from '@navikt/ds-react'
import moment from 'moment'
import { ITilbakemeldingsinnhold } from '../../../constants'

enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

interface IProps {
  tilbakemeldingsinnhold: ITilbakemeldingsinnhold
  sentDate: string
}

export const PvoTilbakemeldingReadOnly = (props: IProps) => {
  const { tilbakemeldingsinnhold, sentDate } = props

  return (
    <div>
      <Heading level="2" size="small" className="mb-5">
        Tilbakemelding fra personvernombudet
      </Heading>

      {sentDate.length !== 0 && (
        <BodyShort size="small" className="pb-5">
          Tilbakemeldings dato: {moment(sentDate).format('ll')}
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
            ' Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives i fritekst under'}
          {tilbakemeldingsinnhold &&
            tilbakemeldingsinnhold.bidragsVurdering === EBidragVerdier.UTILSTREKKELIG &&
            'Utilstrekkelig, beskrives nærmere under'}
        </BodyLong>
      </div>

      <div className="my-5">
        <Label>Tilbakemelding</Label>
        <BodyLong>
          {tilbakemeldingsinnhold &&
            tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere &&
            tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere.length !== 0 &&
            tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere}
          {(!tilbakemeldingsinnhold ||
            !tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere ||
            tilbakemeldingsinnhold.tilbakemeldingTilEtterlevere.length === 0) &&
            'Ingen tilbakemelding'}
        </BodyLong>
      </div>
    </div>
  )
}

export default PvoTilbakemeldingReadOnly
