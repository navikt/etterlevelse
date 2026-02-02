import {
  IEtterlevelseVersjonHistorikk,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Accordion, FormSummary } from '@navikt/ds-react'
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
            <Accordion.Content>
              <GodkjenningsHistorikkContent
                versjonHistorikk={versjon}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

interface IGodkjenningsHistorikkContentProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  versjonHistorikk: IEtterlevelseVersjonHistorikk
}

const GodkjenningsHistorikkContent: FunctionComponent<IGodkjenningsHistorikkContentProps> = ({
  versjonHistorikk,
  etterlevelseDokumentasjon,
}) => {
  return (
    <div>
      <FormSummary>
        <FormSummary.Header>
          <Heading level='2' size='small'>
            Oversikt over etterlevelsen
          </Heading>
        </FormSummary.Header>
        <FormSummary.Answers>
          {versjonHistorikk.kravTilstandHistorikk !== undefined &&
            versjonHistorikk.kravTilstandHistorikk.map((kravHistorikk) => {
              return (
                <FormSummary.Answer
                  key={
                    kravHistorikk.tema + '_' + etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                  }
                >
                  <FormSummary.Label>{kravHistorikk.tema}</FormSummary.Label>
                  <FormSummary.Value>
                    <FormSummary.Answers>
                      <FormSummary.Answer>
                        <FormSummary.Label>Krav</FormSummary.Label>
                        <FormSummary.Value>
                          {kravHistorikk.antallKravUnderArbeid} krav er under arbeid,{' '}
                          {kravHistorikk.antallKravFerdigUtfylt} er ferdig utfylt
                        </FormSummary.Value>
                      </FormSummary.Answer>
                      <FormSummary.Answer>
                        <FormSummary.Label>Suksesskriterier</FormSummary.Label>
                        <FormSummary.Value>
                          {kravHistorikk.antallSuksesskriterieUnderArbeid} suksesskriterier er under
                          arbeid, {kravHistorikk.antallSuksesskriterieOppfylt} er oppfylt,{' '}
                          {kravHistorikk.antallSuksesskriterieOppfylt} er ikke oppfylt,{' '}
                          {kravHistorikk.antallSuksesskriterieIkkeRelevant} er ikke relevant.
                        </FormSummary.Value>
                      </FormSummary.Answer>
                    </FormSummary.Answers>
                  </FormSummary.Value>
                </FormSummary.Answer>
              )
            })}

          <FormSummary.Answer>
            <FormSummary.Label>Behov for PVK</FormSummary.Label>
            <FormSummary.Value>
              <FormSummary.Answers>
                <FormSummary.Answer>
                  <FormSummary.Label>Hvilken vurdering har dere kommet fram til?</FormSummary.Label>
                  <FormSummary.Value>test</FormSummary.Value>
                </FormSummary.Answer>
                <FormSummary.Answer>
                  <FormSummary.Label>Begrunn vurderingen deres</FormSummary.Label>
                  <FormSummary.Value>test</FormSummary.Value>
                </FormSummary.Answer>
              </FormSummary.Answers>
            </FormSummary.Value>
          </FormSummary.Answer>
        </FormSummary.Answers>
      </FormSummary>
    </div>
  )
}

export default EtterlevelsesDokumentasjonGodkjenningsHistorikk
