import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import PvoTilhorendeDokTilbakemeldingsHistorikkContent from './pvoTilhorendeDokTilbakemeldingsHistorikkContent'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurdering: IVurdering
  pvkDokument: IPvkDokument
  forPvo: boolean
}

export const PvoTilhorendeDokTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  pvkDokument,
  relevantVurdering,
  forPvo,
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
      {versioner.map((version) => {
        const tilbakemeldinger = pvoTilbakemelding.vurderinger
          .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === version)
          .sort((a, b) => b.innsendingId - a.innsendingId)

        if (
          !forPvo &&
          tilbakemeldinger.filter(
            (vurdering) => vurdering.innsendingId < relevantVurdering.innsendingId
          ).length === 0 &&
          [undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato)
        ) {
          return null
        }

        return (
          <div key={`version_${version}`} className='mb-5'>
            <Label>Versjon {version}</Label>
            <Accordion className='mt-3'>
              {!forPvo &&
                ![undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato) &&
                version === relevantVurdering.etterlevelseDokumentVersjon && (
                  <Accordion.Item key={`${version}_vurdering_${relevantVurdering.innsendingId}`}>
                    <Accordion.Header>
                      {relevantVurdering.innsendingId}. tilbakemelding -{' '}
                      {moment(relevantVurdering.sendtDato).format('LL')}
                    </Accordion.Header>
                    <Accordion.Content>
                      <PvoTilhorendeDokTilbakemeldingsHistorikkContent
                        tilbakemeldingsinnhold={relevantVurdering.tilhorendeDokumentasjon}
                        forPvo={forPvo}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                )}

              {pvoTilbakemelding.vurderinger
                .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === version)
                .sort((a, b) => b.innsendingId - a.innsendingId)
                .map((vurdering) => {
                  if (vurdering.innsendingId < relevantVurdering.innsendingId) {
                    return (
                      <Accordion.Item key={`vurdering_${vurdering.innsendingId}`}>
                        <Accordion.Header>
                          {vurdering.innsendingId}. tilbakemelding -{' '}
                          {moment(vurdering.sendtDato).format('LL')}
                        </Accordion.Header>
                        <Accordion.Content>
                          <PvoTilhorendeDokTilbakemeldingsHistorikkContent
                            tilbakemeldingsinnhold={vurdering.tilhorendeDokumentasjon}
                            forPvo={forPvo}
                          />
                        </Accordion.Content>
                      </Accordion.Item>
                    )
                  }
                })}
            </Accordion>
          </div>
        )
      })}
    </div>
  )
}

export default PvoTilhorendeDokTilbakemeldingsHistorikk
