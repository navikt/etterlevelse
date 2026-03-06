import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading, Label } from '@navikt/ds-react'
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
  const versioner = [
    ...new Set(
      pvoTilbakemelding.vurderinger.map((vurdering) => vurdering.etterlevelseDokumentVersjon)
    ),
  ].sort((a, b) => b - a)

  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>
      {versioner.map((version) => (
        <div key={`version_${version}`} className='mb-5'>
          <Label>Versjon {version}</Label>
          <Accordion className='mt-3'>
            {pvoTilbakemelding.vurderinger
              .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === version)
              .map((vurdering) => {
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
      ))}
    </div>
  )
}

export default PvoTilhorendeDokTilbakemeldingsHistorikk
