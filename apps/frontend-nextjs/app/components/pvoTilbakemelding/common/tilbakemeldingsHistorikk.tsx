import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import PvoTilbakemeldingReadOnly from '../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  fieldName:
    | 'behandlingenslivslop'
    | 'behandlingensArtOgOmfang'
    | 'innvolveringAvEksterne'
    | 'risikoscenarioEtterTiltakk'
  relevantVurderingsInnsendingId: number
}

export const TilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  fieldName,
  relevantVurderingsInnsendingId,
}) => {
  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>
      <Accordion>
        {pvoTilbakemelding.vurderinger
          .sort((a, b) => b.innsendingId - a.innsendingId)
          .map((vurdering) => {
            if (vurdering.innsendingId < relevantVurderingsInnsendingId) {
              return (
                <Accordion.Item key={`vurdering_${vurdering.innsendingId}`}>
                  <Accordion.Header>
                    {vurdering.innsendingId}. tilbakemelding -{' '}
                    {moment(vurdering.sendtDato).format('LL')}
                  </Accordion.Header>
                  <Accordion.Content>
                    <PvoTilbakemeldingReadOnly
                      tilbakemeldingsinnhold={vurdering[fieldName]}
                      sentDate={vurdering.sendtDato}
                      forPvo={true}
                      noHeader={true}
                    />
                  </Accordion.Content>
                </Accordion.Item>
              )
            }
          })}
      </Accordion>
    </div>
  )
}

export default TilbakemeldingsHistorikk
