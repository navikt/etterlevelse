import {
  IKravTilstandHistorikk,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { FormSummary } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IProps {
  kravHistorikk: IKravTilstandHistorikk
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  index: number
}

export const GodkjenningAvRisikoeierKravFormSummary: FunctionComponent<IProps> = ({
  kravHistorikk,
  etterlevelseDokumentasjon,
  index,
}) => (
  <FormSummary.Answer
    key={
      kravHistorikk.tema + '_' + etterlevelseDokumentasjon.etterlevelseDokumentVersjon + '_' + index
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
            {kravHistorikk.antallSuksesskriterieUnderArbeid} suksesskriterier er under arbeid,{' '}
            {kravHistorikk.antallSuksesskriterieOppfylt} er oppfylt,{' '}
            {kravHistorikk.antallSuksesskriterieOppfylt} er ikke oppfylt,{' '}
            {kravHistorikk.antallSuksesskriterieIkkeRelevant} er ikke relevant.
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary.Value>
  </FormSummary.Answer>
)
