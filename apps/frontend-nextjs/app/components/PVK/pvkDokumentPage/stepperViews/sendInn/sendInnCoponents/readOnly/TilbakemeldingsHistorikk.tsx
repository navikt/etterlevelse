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
  defaultFirstOpen?: boolean
}

export const TilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  antallInnsendingTilPvo,
  vurderinger,
  meldingerTilPvo,
  pvoVurderingList,
  defaultFirstOpen,
}) => {
  return (
    <div className='my-5'>
      <Heading size='medium' level='2' className='mb-5'>
        Versjonshistorikk
      </Heading>
      <Heading size='small' level='3' className='mb-5'>
        Versjon 1
      </Heading>

      <div className='my-5'>
        {vurderinger
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
                      meldingerTilPvo.filter(
                        (melding) => melding.innsendingId === vurdering.innsendingId
                      )[0]
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
