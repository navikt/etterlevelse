import { Accordion, Heading, Label } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
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

const PvoTilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
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

  const isTidligereVurdering = (vurdering: IVurdering) =>
    vurdering.etterlevelseDokumentVersjon < relevantVurdering.etterlevelseDokumentVersjon ||
    (vurdering.etterlevelseDokumentVersjon === relevantVurdering.etterlevelseDokumentVersjon &&
      vurdering.innsendingId < relevantVurdering.innsendingId)

  return (
    <div className='px-2'>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>

      {versjoner.map((versjon) => {
        const tilbakemeldinger = pvoTilbakemelding.vurderinger
          .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === versjon)
          .sort((a, b) => b.innsendingId - a.innsendingId)

        if (
          !forPvo &&
          !tilbakemeldinger.some(isTidligereVurdering) &&
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
                    <Accordion.Header className='sticky top-0 z-1 bg-[#E3EFF7]'>
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
                if (isTidligereVurdering(vurdering)) {
                  return (
                    <Accordion.Item key={`${versjon}_vurdering_${vurdering.innsendingId}`}>
                      <Accordion.Header className='sticky top-0 z-1 bg-[#E3EFF7]'>
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
