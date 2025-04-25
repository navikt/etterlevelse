import { BodyShort, FormSummary } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IBehandlingensLivslop } from '../../../constants'
import FormAlert from './FormAlert'

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
        Tegn behandlingens livslop
      </FormSummary.Heading>
      <FormSummary.EditLink
        className='cursor-pointer'
        onClick={() => updateTitleUrlAndStep(2)}
        href={window.location.pathname.slice(0, -1) + 2}
      >
        Endre svar
      </FormSummary.EditLink>
    </FormSummary.Header>
    <FormSummary.Answers>
      <FormSummary.Answer>
        <FormSummary.Value>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>Behandlingens livsløp</FormSummary.Label>
              <FormSummary.Value>
                <div>
                  {behandlingensLivslopError && (
                    <FormAlert>
                      Behandlingens livsløp må ha minimum 1 opplastet tegning eller en skriftlig
                      beskrivelse.
                    </FormAlert>
                  )}

                  {!behandlingensLivslopError && (
                    <div>
                      <BodyShort>Antall filer: {behandlingensLivslop?.filer.length}</BodyShort>
                    </div>
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
