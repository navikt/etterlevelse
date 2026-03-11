import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading, Label } from '@navikt/ds-react'
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
  relevantVurdering: IVurdering
  pvkDokument: IPvkDokument
  forPvo: boolean
}

export const PvoTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  fieldName,
  relevantVurdering,
  pvkDokument,
  forPvo,
}) => {
  const versjoner = [
    ...new Set(
      pvoTilbakemelding.vurderinger.map((vurdering) => vurdering.etterlevelseDokumentVersjon)
    ),
  ].sort((a, b) => b - a)
  let vurderingerForVersjon: IVurdering[] = []
  const sortertVurderingerForVersjon: IVurdering[] = pvoTilbakemelding.vurderinger.sort(
    (a: IVurdering, b: IVurdering) => b.innsendingId - a.innsendingId
  )

  sortertVurderingerForVersjon.map((vurdering: IVurdering) => {
    if (vurdering.innsendingId < relevantVurdering.innsendingId) {
      vurderingerForVersjon.push(vurdering)
    }
  })

  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>

      {versjoner.map((versjon) => {
        const tilbakemeldinger = pvoTilbakemelding.vurderinger
          .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === versjon)
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
          <div key={'tilbakemelding_historik_' + versjon} className='mb-5'>
            <Label>Versjon {versjon}</Label>

            <Accordion className='mt-3'>
              {!forPvo &&
                ![undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato) &&
                versjon === relevantVurdering.etterlevelseDokumentVersjon && (
                  <Accordion.Item key={`${versjon}_vurdering_${relevantVurdering.innsendingId}`}>
                    <Accordion.Header>
                      {relevantVurdering.innsendingId}. tilbakemelding -{' '}
                      {moment(relevantVurdering.sendtDato).format('LL')}
                    </Accordion.Header>
                    <Accordion.Content>
                      <PvoTilbakemeldingsHistorikkContent
                        tilbakemeldingsinnhold={relevantVurdering[fieldName]}
                        forPvo={forPvo}
                        noHeader={true}
                      />
                    </Accordion.Content>
                  </Accordion.Item>
                )}

              {tilbakemeldinger.map((vurdering) => {
                if (vurdering.innsendingId < relevantVurdering.innsendingId) {
                  return (
                    <Accordion.Item key={`${versjon}_vurdering_${vurdering.innsendingId}`}>
                      <Accordion.Header>
                        {vurdering.innsendingId}. tilbakemelding -{' '}
                        {moment(vurdering.sendtDato).format('LL')}
                      </Accordion.Header>
                      <Accordion.Content>
                        <PvoTilbakemeldingsHistorikkContent
                          tilbakemeldingsinnhold={vurdering[fieldName]}
                          forPvo={forPvo}
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
      })}
    </div>
  )
}

export default PvoTilbakemeldingsHistorikk
