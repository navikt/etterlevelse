import { BodyShort, FormSummary, List } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { StepTitle } from '../../../pages/PvkDokumentPage'

interface IProps {
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
}

export const InvolveringSummary = (props: IProps) => {
  const { updateTitleUrlAndStep, personkategorier, databehandlere } = props
  return (
    <Field>
      {(fieldProp: FieldProps) => (
        <FormSummary className="my-3">
          <FormSummary.Header>
            <FormSummary.Heading level="2">{StepTitle[2]}</FormSummary.Heading>
            <FormSummary.EditLink
              className="cursor-pointer"
              onClick={() => updateTitleUrlAndStep(3)}
              tabIndex={0}
            >
              Endre svar
            </FormSummary.EditLink>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>Representanter for de registrerte</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      I Behandlingskatalogen står det at dere behandler personopplysninger om:
                    </FormSummary.Label>
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
                    <FormSummary.Label>Stemmer disse personkategoriene?</FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.stemmerPersonkategorier ? 'Ja' : 'Nei'}
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Har dere involvert en representant for de registrerte?
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.harInvolvertRepresentant ? 'Ja' : 'Nei'}
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Utdyp hvordan dere har involvert representant(er) for de registrerte
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <BodyShort>
                        {fieldProp.form.values.representantInvolveringsBeskrivelse}
                      </BodyShort>
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
                    <FormSummary.Label>
                      Har dere involvert en representant for databehandlere?
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.harDatabehandlerRepresentantInvolvering ? 'Ja' : 'Nei'}
                    </FormSummary.Value>
                  </FormSummary.Answer>

                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Utdyp hvordan dere har involvert representant(er) for databehandler(e)
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <BodyShort>
                        {fieldProp.form.values.dataBehandlerRepresentantInvolveringBeskrivelse}
                      </BodyShort>
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
