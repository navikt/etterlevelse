import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import PvoTilbakemeldingsHistorikkContent from './pvoTilbakemeldingsHistorikkContent'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  fieldName:
    | 'behandlingenslivslop'
    | 'behandlingensArtOgOmfang'
    | 'innvolveringAvEksterne'
    | 'risikoscenarioEtterTiltakk'
  relevantVurderingsInnsendingId: number
}

export const PvoTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  fieldName,
  relevantVurderingsInnsendingId,
}) => {
  let vurderingerForVersjon: IVurdering[] = []
  const sortertVurderingerForVersjon: IVurdering[] = pvoTilbakemelding.vurderinger.sort(
    (a: IVurdering, b: IVurdering) => b.innsendingId - a.innsendingId
  )

  sortertVurderingerForVersjon.map((vurdering: IVurdering) => {
    if (vurdering.innsendingId < relevantVurderingsInnsendingId) {
      vurderingerForVersjon.push(vurdering)
    }
  })

  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>
      <Accordion>
        {vurderingerForVersjon.map((vurdering: IVurdering) => (
          <Accordion.Item key={`vurdering_${vurdering.innsendingId}`}>
            <Accordion.Header>
              {vurdering.innsendingId}. tilbakemelding - {moment(vurdering.sendtDato).format('LL')}
            </Accordion.Header>
            <Accordion.Content>
              <PvoTilbakemeldingsHistorikkContent
                tilbakemeldingsinnhold={vurdering[fieldName]}
                forPvo={true}
                noHeader={true}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default PvoTilbakemeldingsHistorikk
