import { BodyShort, FormSummary, List } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { StepTitle } from '../../../pages/PvkDokumentPage'

interface IProps {
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
}

export const ArtOgOmFangSummary = (props: IProps) => {
  const { updateTitleUrlAndStep, personkategorier } = props
  return (
    <Field>
      {(fieldProp: FieldProps) => (
        <FormSummary className="my-3">
          <FormSummary.Header>
            <FormSummary.Heading level="2">{StepTitle[1]}</FormSummary.Heading>
            <FormSummary.EditLink
              className="cursor-pointer"
              onClick={() => updateTitleUrlAndStep(2)}
            >
              Endre svar
            </FormSummary.EditLink>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Label>Hvem behandles det personopplysninger om?</FormSummary.Label>
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
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Label>
                Hvor mange personer behandles det personopplysninger om?
              </FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Beskriv antall personer dere behandler personopplysninger om
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <BodyShort>{fieldProp.form.values.personkategoriAntallBeskrivelse}</BodyShort>
                    </FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Label>Hvem skal ha tilgang til opplysningene?</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Besktriv hvilke roller som skal ha tilgang
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <BodyShort>
                        {fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene}
                      </BodyShort>
                    </FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Label>
                Hvordan og hvor lenge skal personopplysningene lagres?
              </FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Beskriv hvordan og hvor lenge personopplysningene skal lagres
                    </FormSummary.Label>
                    <FormSummary.Value>
                      <BodyShort>
                        {fieldProp.form.values.lagringsBeskrivelsePersonopplysningene}
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
export default ArtOgOmFangSummary