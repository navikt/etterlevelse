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

            if (melding.sendtTilPvoDato) {
              const vurdering = vurderinger.filter(
                (vurdering) =>
                  vurdering.innsendingId === melding.innsendingId &&
                  vurdering.etterlevelseDokumentVersjon === melding.etterlevelseDokumentVersjon
              )
              const sendtAvPvo =
                vurdering.length !== 0 && vurdering[0].sendtAv !== ''
                  ? vurdering[0].sendtAv.split(' - ')[1]
                  : 'Personvernombudet'
              return (
                <>
                  <List.Item key={`${index}_innsending_${melding.innsendingId}`}>
                    {moment(melding.sendtTilPvoDato).format('DD. MMM YYYY')}&nbsp;&nbsp;&nbsp;
                    {melding.innsendingId}. innsending til PVO av {melderNavm}
                  </List.Item>

                  {vurdering.length !== 0 && vurdering[0].sendtDato && (
                    <ListItem key={`${index}_innsending_${melding.innsendingId}_vurdering`}>
                      {moment(vurdering[0].sendtDato).format('DD. MMM YYYY')}
                      &nbsp;&nbsp;&nbsp;tilbakemelding fra {sendtAvPvo}
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
