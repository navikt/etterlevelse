import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Heading, Label } from '@navikt/ds-react'
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
  const vurderingerForVersjon: IVurdering[] = []
  const versjoner = [
    ...new Set(
      pvoTilbakemelding.vurderinger.map((vurdering) => vurdering.etterlevelseDokumentVersjon)
    ),
  ].sort((a, b) => b - a)

  return (
    <div>
      <Heading level='2' size='small' className='mb-5'>
        Tilbakemeldingshistorikk
      </Heading>

      {versjoner.map((versjon: number) => {
        pvoTilbakemelding.vurderinger
          .filter(
            (vurdering: IVurdering) =>
              vurdering.etterlevelseDokumentVersjon === versjon &&
              vurdering.innsendingId < relevantVurderingsInnsendingId
          )
          .sort((a: IVurdering, b: IVurdering) => b.innsendingId - a.innsendingId)
          .map((vurdering: IVurdering) => vurderingerForVersjon.push(vurdering))

        return (
          <>
            {vurderingerForVersjon.length !== 0 && (
              <div key={'tilbakemeldinghistorikk_label_' + versjon} className='mb-5'>
                <Label>Versjon {versjon}</Label>
                <Accordion className='mt-3'>
                  {vurderingerForVersjon.map((vurdering: IVurdering) => (
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
                  ))}
                </Accordion>
              </div>
            )}
          </>
        )
      })}
    </div>
  )
}

export default PvoSendInnTilbakemeldingsHistorikk
