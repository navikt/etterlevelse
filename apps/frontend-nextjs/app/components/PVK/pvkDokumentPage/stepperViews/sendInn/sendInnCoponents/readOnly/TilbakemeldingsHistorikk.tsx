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
  vurderinger?: IVurdering[]
  meldingerTilPvo: IMeldingTilPvo[]
  pvoVurderingList: ICode[]
  etterlevelseDokumentVersjon: number
  defaultFirstOpen?: boolean
}

export const TilbakemeldingsHistorikk: FunctionComponent<TProps> = ({
  antallInnsendingTilPvo,
  vurderinger = [],
  meldingerTilPvo,
  pvoVurderingList,
  etterlevelseDokumentVersjon,
  defaultFirstOpen,
}) => {
  const versjoner = [
    ...new Set(vurderinger.map((vurdering) => vurdering.etterlevelseDokumentVersjon)),
  ].sort((a, b) => b - a)

  return (
    <div className='my-5'>
      <Heading size='medium' level='2' className='mb-5'>
        Versjonshistorikk
      </Heading>

      {versjoner.map((versjon) => (
        <div key={versjon} className='my-5'>
          <Heading size='small' level='3' className='mb-5'>
            Versjon {versjon}
          </Heading>

          {vurderinger
            .filter((vurdering) => vurdering.etterlevelseDokumentVersjon === versjon)
            .sort((a, b) => b.innsendingId - a.innsendingId)
            .map((vurdering, index) => {
              if (vurdering.innsendingId <= antallInnsendingTilPvo) {
                return (
                  <ReadMore
                    key={`${versjon}_${vurdering.innsendingId}_${index}`}
                    header={`${vurdering.innsendingId}. innsending til PVO, ${moment(vurdering.sendtDato).format('LL')}`}
                    defaultOpen={
                      vurdering.innsendingId === antallInnsendingTilPvo &&
                      vurdering.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon &&
                      defaultFirstOpen
                        ? true
                        : false
                    }
                    className='mt-3'
                  >
                    <BeskjedTilPvoReadOnly
                      meldingTilPvo={
                        meldingerTilPvo.filter(
                          (melding) =>
                            melding.innsendingId === vurdering.innsendingId &&
                            melding.etterlevelseDokumentVersjon ===
                              vurdering.etterlevelseDokumentVersjon
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
      ))}
    </div>
  )
}
export default TilbakemeldingsHistorikk
