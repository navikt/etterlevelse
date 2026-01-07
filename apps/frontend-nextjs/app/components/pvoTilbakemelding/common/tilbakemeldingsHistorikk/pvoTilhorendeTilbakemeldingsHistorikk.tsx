import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import PvoTilhorendeTilbakemeldingsHistorikkContent from './pvoTilhorendeTilbakemeldingsHistorikkContent'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurderingsInnsendingId: number
}

export const PvoTilhorendeTilbakemeldingdHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  relevantVurderingsInnsendingId,
}) => {
  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>
      <Accordion>
        {pvoTilbakemelding.vurderinger.map((vurdering) => {
          if (vurdering.innsendingId < relevantVurderingsInnsendingId) {
            return (
              <Accordion.Item key={`vurdering_${vurdering.innsendingId}`}>
                <Accordion.Header>
                  {vurdering.innsendingId}. tilbakemelding -{' '}
                  {moment(vurdering.sendtDato).format('LL')}
                </Accordion.Header>
                <Accordion.Content>
                  <PvoTilhorendeTilbakemeldingsHistorikkContent
                    tilbakemeldingsinnhold={vurdering.tilhorendeDokumentasjon}
                    forPvo={true}
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

export default PvoTilhorendeTilbakemeldingdHistorikk
