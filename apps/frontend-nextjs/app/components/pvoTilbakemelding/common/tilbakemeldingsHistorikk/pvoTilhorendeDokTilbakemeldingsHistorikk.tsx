import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import PvoTilhorendeDokTilbakemeldingsHistorikkContent from './pvoTilhorendeDokTilbakemeldingsHistorikkContent'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurderingsInnsendingId: number
}

export const PvoTilhorendeDokTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
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
                  <PvoTilhorendeDokTilbakemeldingsHistorikkContent
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

export default PvoTilhorendeDokTilbakemeldingsHistorikk
