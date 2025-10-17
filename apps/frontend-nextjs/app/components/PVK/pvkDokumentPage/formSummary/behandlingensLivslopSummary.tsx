import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { FormSummary, Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import FormAlert from './formAlert'

type TProps = {
  behandlingensLivslop?: IBehandlingensLivslop
  updateTitleUrlAndStep: (step: number) => void
  behandlingensLivslopError: boolean
}
export const BehandlingensLivslopSummary: FunctionComponent<TProps> = ({
  behandlingensLivslop,
  updateTitleUrlAndStep,
  behandlingensLivslopError,
}) => (
  <FormSummary className='my-3'>
    <FormSummary.Header>
      <FormSummary.Heading level='2' id='behandlingensLivslop'>
        Tegn behandlingens livsløp
      </FormSummary.Heading>
      <FormSummary.EditLink
        className='cursor-pointer'
        onClick={() => updateTitleUrlAndStep(2)}
        href={window.location.pathname + '?steg=' + 2}
      >
        Endre svar
      </FormSummary.EditLink>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>
                Last opp behandlingens livsløp, og/eller legg inn en skriftlig beskrivelse
              </FormSummary.Label>
              <FormSummary.Value>
                <div className='gap-2 flex pt-1'>
                  {!behandlingensLivslop && (
                    <Tag variant='neutral' size='xsmall'>
                      Ikke påbegynt
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length === 0 && (
                    <Tag variant='neutral' size='xsmall'>
                      Ingen filer er lastet opp
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length !== 0 && (
                    <Tag variant='success' size='xsmall'>
                      Lastet opp {behandlingensLivslop.filer.length}{' '}
                      {behandlingensLivslop.filer.length === 1 ? 'fil' : 'filer'}
                    </Tag>
                  )}
                  {behandlingensLivslop && (
                    <Tag
                      variant={
                        behandlingensLivslop.beskrivelse !== '' &&
                        behandlingensLivslop.beskrivelse !== undefined
                          ? 'success'
                          : 'neutral'
                      }
                      size='xsmall'
                    >
                      {behandlingensLivslop.beskrivelse !== '' &&
                      behandlingensLivslop.beskrivelse !== undefined
                        ? 'Skriftlig beskrivelse'
                        : 'Ingen skriftlig beskrivelse'}
                    </Tag>
                  )}
                </div>
                <div>
                  {behandlingensLivslopError && (
                    <FormAlert>
                      Behandlingens livsløp må få minst én opplastet tegning eller en skriftlig
                      beskrivelse
                    </FormAlert>
                  )}
                </div>
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary.Value>
      </FormSummary.Answer>
    </FormSummary.Answers>
  </FormSummary>
)

export default BehandlingensLivslopSummary
