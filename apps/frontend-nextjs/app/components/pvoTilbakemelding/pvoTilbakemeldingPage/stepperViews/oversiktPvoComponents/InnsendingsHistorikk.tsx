import {
  IMeldingTilPvo,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Label, List, ReadMore } from '@navikt/ds-react'
import { ListItem } from '@navikt/ds-react/List'
import moment from 'moment'
import { Fragment, FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  vurderinger: IVurdering[]
  meldingerTilPvo: IMeldingTilPvo[]
}

export const InnsendingHistorikk: FunctionComponent<TProps> = ({
  pvkDokument,
  meldingerTilPvo,
  vurderinger,
}) => {
  const versjoner = [
    ...new Set(meldingerTilPvo.map((melding) => melding.etterlevelseDokumentVersjon)),
  ].sort((a, b) => a - b)

  return (
    <div>
      <ReadMore header='Vis innsendingshistorikken'>
        {versjoner.map((versjon) => {
          const meldingerTilPvoForVersjon = meldingerTilPvo.filter(
            (melding) => melding.etterlevelseDokumentVersjon === versjon
          )

          if (meldingerTilPvoForVersjon.length === 0) {
            return null
          }

          return (
            <div className='mb-5' key={'innsending_versjon_' + versjon}>
              <Label key={'innsending_' + versjon}>Versjon {versjon}</Label>
              <List>
                {meldingerTilPvoForVersjon.map((melding, index) => {
                  if (
                    pvkDokument.antallInnsendingTilPvo >= melding.innsendingId &&
                    melding.sendtTilPvoDato
                  ) {
                    const melderNavn = ![undefined, null, ''].includes(melding.sendtTilPvoAv)
                      ? melding.sendtTilPvoAv.split(' - ')[1]
                      : ''
                    const vurdering = vurderinger.filter(
                      (vurdering) =>
                        vurdering.innsendingId === melding.innsendingId &&
                        vurdering.etterlevelseDokumentVersjon ===
                          melding.etterlevelseDokumentVersjon
                    )
                    const sendtAvPvo =
                      vurdering.length !== 0 &&
                      vurdering[0].sendtAv !== '' &&
                      vurdering[0].sendtAv !== null
                        ? vurdering[0].sendtAv.split(' - ')[1]
                        : 'Personvernombudet'

                    return (
                      <Fragment key={`melding_${index}_innsending_${melding.innsendingId}`}>
                        <List.Item key={`etterleveler_${index}_innsending_${melding.innsendingId}`}>
                          {moment(melding.sendtTilPvoDato).format('DD. MMM YYYY')}
                          &nbsp;&nbsp;&nbsp;
                          {melding.innsendingId}. innsending til PVO av {melderNavn}
                        </List.Item>

                        {vurdering.length !== 0 && vurdering[0].sendtDato && (
                          <ListItem key={`${index}_innsending_${melding.innsendingId}_vurdering`}>
                            {moment(vurdering[0].sendtDato).format('DD. MMM YYYY')}
                            &nbsp;&nbsp;&nbsp;tilbakemelding fra {sendtAvPvo}
                          </ListItem>
                        )}
                      </Fragment>
                    )
                  }
                })}
              </List>
            </div>
          )
        })}
      </ReadMore>
    </div>
  )
}

export default InnsendingHistorikk
