import { IMeldingTilPvo } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { List, ReadMore } from '@navikt/ds-react'
import { ListItem } from '@navikt/ds-react/List'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  vurderinger: IVurdering[]
  meldingerTilPvo: IMeldingTilPvo[]
}

export const InnsendingHistorikk: FunctionComponent<TProps> = ({
  meldingerTilPvo,
  vurderinger,
}) => {
  return (
    <div>
      <ReadMore header='Vis innsendingshistorikken'>
        <List>
          {meldingerTilPvo.map((melding, index) => {
            const melderNavm = melding.sendtTilPvoAv.split(' - ')[1]
            const vurdering = vurderinger.filter(
              (vurdering) => vurdering.innsendingId === melding.innsendingId
            )

            if (melding.sendtTilPvoDato) {
              return (
                <>
                  <List.Item key={`${index}_innsending_${melding.innsendingId}`}>
                    {moment(melding.sendtTilPvoDato).format('DD. MMM YYYY')} {melding.innsendingId}.
                    innsending til Pvo av {melderNavm}
                  </List.Item>

                  {vurdering.length !== 0 && (
                    <ListItem key={`${index}_innsending_${melding.innsendingId}_vurdering`}>
                      {moment(vurdering[0].sendtDato).format('DD. MMM YYYY')} sendt i retur av WIP
                    </ListItem>
                  )}
                </>
              )
            }
          })}
        </List>
      </ReadMore>
    </div>
  )
}
