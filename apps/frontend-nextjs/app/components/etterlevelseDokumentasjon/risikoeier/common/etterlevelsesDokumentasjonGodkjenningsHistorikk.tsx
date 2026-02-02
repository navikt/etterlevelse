import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Accordion } from '@navikt/ds-react'
import { Heading } from '@navikt/ds-react/Typography'
import moment from 'moment'
import { FunctionComponent } from 'react'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelsesDokumentasjonGodkjenningsHistorikk: FunctionComponent<IProps> = ({
  etterlevelseDokumentasjon,
}) => {
  return (
    <div className='my-5 max-w-[75ch]'>
      <Heading level='2' size='medium' className='mb-5'>
        Godkjenningshistorikk
      </Heading>

      <Accordion>
        {etterlevelseDokumentasjon.versjonHistorikk.map((versjon, index) => (
          <Accordion.Item key={versjon.versjon + '_historikk' + index}>
            <Accordion.Header>
              Versjon {versjon.versjon}, godkjent av {versjon.godkjentAvRisikoeier},{' '}
              {moment(versjon.godkjentAvRisikoierDato).format('LL')}
            </Accordion.Header>
            <Accordion.Content>test</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default EtterlevelsesDokumentasjonGodkjenningsHistorikk
