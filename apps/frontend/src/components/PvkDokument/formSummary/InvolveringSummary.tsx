import { BodyShort, FormSummary, List } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { FunctionComponent } from 'react'
import { EPVK } from '../../../constants'
import { StepTitle } from '../../../pages/PvkDokumentPage'
import FormAlert from './FormAlert'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  customLinktext?: string
  customStepNumber?: number
}

export const InvolveringSummary: FunctionComponent<TProps> = ({
  personkategorier,
  customLinktext,
  databehandlere,
  customStepNumber,
}) => {
  const booleanToText = (value?: boolean) => {
    if (value === undefined || value === null) {
      return 'Ikke besvart'
    } else if (value === true) return 'Ja'
    else return 'Nei'
  }

  return (
    <Field>
      {(fieldProp: FieldProps) => (
        <FormSummary className='my-3'>
          <FormSummary.Header>
            <FormSummary.Heading level='2'>{StepTitle[4]}</FormSummary.Heading>
            <FormSummary.EditLink
              className='cursor-pointer'
              href={
                window.location.pathname.slice(0, -1) + `${customStepNumber ? customStepNumber : 5}`
              }
            >
              {customLinktext ? customLinktext : 'Endre svar'}
            </FormSummary.EditLink>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>Representanter for de registrerte</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>{EPVK.behandlingAvPersonopplysninger}</FormSummary.Label>
                    <FormSummary.Value>
                      <List>
                        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                        {personkategorier.length > 0 &&
                          personkategorier.map((personkategori) => (
                            <List.Item key={personkategori}>{personkategori}</List.Item>
                          ))}
                      </List>
                    </FormSummary.Value>
                  </FormSummary.Answer>
                  <FormSummary.Answer>
                    <FormSummary.Label id='harInvolvertRepresentant'>
                      Har dere involvert en representant for de registrerte?
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {booleanToText(fieldProp.form.values.harInvolvertRepresentant)}
                      {fieldProp.form.errors.harInvolvertRepresentant && (
                        <FormAlert>
                          {fieldProp.form.errors.harInvolvertRepresentant as string}
                        </FormAlert>
                      )}
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label id='representantInvolveringsBeskrivelse'>
                      Utdyp hvordan dere har involvert representant(er) for de registrerte
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.representantInvolveringsBeskrivelse && (
                        <BodyShort>
                          {fieldProp.form.values.representantInvolveringsBeskrivelse}
                        </BodyShort>
                      )}
                      {!fieldProp.form.errors.representantInvolveringsBeskrivelse &&
                        !fieldProp.form.values.representantInvolveringsBeskrivelse && (
                          <BodyShort>Ikke besvart</BodyShort>
                        )}
                      {fieldProp.form.errors.representantInvolveringsBeskrivelse && (
                        <FormAlert>
                          {fieldProp.form.errors.representantInvolveringsBeskrivelse as string}
                        </FormAlert>
                      )}
                    </FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Label>Representanter for databehandlere</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      I Behandlingskatalogen står det at følgende databehandlere benyttes:
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <List>
                        {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                        {databehandlere.length > 0 &&
                          databehandlere.map((databehandler) => (
                            <List.Item key={databehandler}>{databehandler}</List.Item>
                          ))}
                      </List>
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label id='harDatabehandlerRepresentantInvolvering'>
                      Har dere involvert en representant for databehandlere?
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {booleanToText(fieldProp.form.values.harDatabehandlerRepresentantInvolvering)}
                      {fieldProp.form.errors.harDatabehandlerRepresentantInvolvering && (
                        <FormAlert>
                          {fieldProp.form.errors.harDatabehandlerRepresentantInvolvering as string}
                        </FormAlert>
                      )}
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label id='dataBehandlerRepresentantInvolveringBeskrivelse'>
                      Utdyp hvordan dere har involvert representant(er) for databehandler(e)
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.dataBehandlerRepresentantInvolveringBeskrivelse && (
                        <BodyShort>
                          {fieldProp.form.values.dataBehandlerRepresentantInvolveringBeskrivelse}
                        </BodyShort>
                      )}
                      {!fieldProp.form.errors.dataBehandlerRepresentantInvolveringBeskrivelse &&
                        !fieldProp.form.values.dataBehandlerRepresentantInvolveringBeskrivelse && (
                          <BodyShort>Ikke besvart</BodyShort>
                        )}
                      {fieldProp.form.errors.dataBehandlerRepresentantInvolveringBeskrivelse && (
                        <FormAlert>
                          {
                            fieldProp.form.errors
                              .dataBehandlerRepresentantInvolveringBeskrivelse as string
                          }
                        </FormAlert>
                      )}
                    </FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>
          </FormSummary.Answers>
        </FormSummary>
      )}
    </Field>
  )
}

export default InvolveringSummary
