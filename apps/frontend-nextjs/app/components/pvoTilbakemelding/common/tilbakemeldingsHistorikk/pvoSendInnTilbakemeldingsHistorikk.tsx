import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { SendInnPvoReadOnly } from '../../readOnly/sendInnPvoReadOnly'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurderingsInnsendingId: number
  pvkDokument: IPvkDokument
  pvoVurderingList: ICode[]
}

export const PvoSendInnTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  relevantVurderingsInnsendingId,
  pvkDokument,
  pvoVurderingList,
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
                    <SendInnPvoReadOnly
                      pvkDokument={pvkDokument}
                      relevantVurdering={vurdering}
                      pvoVurderingList={pvoVurderingList}
                      headingLevel='2'
                      headingSize='small'
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

export default PvoSendInnTilbakemeldingsHistorikk
