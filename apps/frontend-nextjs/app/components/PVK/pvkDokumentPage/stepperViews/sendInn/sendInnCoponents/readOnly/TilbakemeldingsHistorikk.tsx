import { IMeldingTilPvo } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Heading, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { BeskjedFraPvoReadOnly } from './beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './beskjedTilPvoReadOnly'

type TProps = {
  antallInnsendingTilPvo: number
  vurderinger: IVurdering[]
  meldingerTilPvo: IMeldingTilPvo[]
  pvoVurderingList: ICode[]
  etterlevelseDokumentVersjon: number
  defaultFirstOpen?: boolean
}

export const TilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  antallInnsendingTilPvo,
  vurderinger,
  meldingerTilPvo,
  pvoVurderingList,
  etterlevelseDokumentVersjon,
  defaultFirstOpen,
}) => {
  return (
    <div className='my-5'>
      <Heading size='medium' level='2' className='mb-5'>
        Versjonshistorikk
      </Heading>
      <Heading size='small' level='3' className='mb-5'>
        Versjon {etterlevelseDokumentVersjon}
      </Heading>

      <div className='my-5'>
        {vurderinger
          .filter(
            (vurdering) => vurdering.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon
          )
          .sort((a, b) => b.innsendingId - a.innsendingId)
          .map((vurdering, index) => {
            if (vurdering.innsendingId <= antallInnsendingTilPvo) {
              return (
                <ReadMore
                  key={`${vurdering.innsendingId}_${index}`}
                  header={`${vurdering.innsendingId}. innsending til PVO, ${moment(vurdering.sendtDato).format('LL')}`}
                  defaultOpen={
                    vurdering.innsendingId === antallInnsendingTilPvo && defaultFirstOpen
                      ? true
                      : false
                  }
                  className='mt-3'
                >
                  <BeskjedTilPvoReadOnly
                    meldingTilPvo={
                      meldingerTilPvo.find(
                        (melding) =>
                          melding.innsendingId === vurdering.innsendingId &&
                          melding.etterlevelseDokumentVersjon ===
                            vurdering.etterlevelseDokumentVersjon
                      ) ?? {
                        innsendingId: vurdering.innsendingId,
                        etterlevelseDokumentVersjon: vurdering.etterlevelseDokumentVersjon,
                        merknadTilPvo: '',
                        endringsNotat: '',
                        sendtTilPvoDato: '',
                        sendtTilPvoAv: '',
                      }
                    }
                  />
                  <BeskjedFraPvoReadOnly
                    relevantVurdering={vurdering}
                    pvoVurderingList={pvoVurderingList}
                  />
                </ReadMore>
              )
            }
          })}
      </div>
    </div>
  )
}
export default TilbakemeldingsHistorikk
