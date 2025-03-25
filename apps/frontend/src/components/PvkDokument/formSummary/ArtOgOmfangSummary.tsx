import { BodyShort, FormSummary, List } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { StepTitle } from '../../../pages/PvkDokumentPage'

interface IProps {
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  customLinktext?: string
  customStepNumber?: number
}

export const ArtOgOmFangSummary = (props: IProps) => {
  const { updateTitleUrlAndStep, personkategorier, customLinktext, customStepNumber } = props
  return (
    <Field>
      {(fieldProp: FieldProps) => (
        <FormSummary className="my-3">
          <FormSummary.Header>
            <FormSummary.Heading level="2">{StepTitle[1]}</FormSummary.Heading>
            <FormSummary.EditLink
              className="cursor-pointer"
              onClick={() => updateTitleUrlAndStep(customStepNumber ? customStepNumber : 3)}
              href={
                window.location.pathname.slice(0, -1) + `${customStepNumber ? customStepNumber : 3}`
              }
            >
              {customLinktext ? customLinktext : 'Endre svar'}
            </FormSummary.EditLink>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
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
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Beskriv antall personer dere behandler personopplysninger om
                    </FormSummary.Label>
                    {fieldProp.form.values.personkategoriAntallBeskrivelse && (
                      <FormSummary.Value>
                        <BodyShort>
                          {fieldProp.form.values.personkategoriAntallBeskrivelse}
                        </BodyShort>
                      </FormSummary.Value>
                    )}
                    {!fieldProp.form.values.personkategoriAntallBeskrivelse && (
                      <FormSummary.Value>
                        <BodyShort>Ikke besvart</BodyShort>
                      </FormSummary.Value>
                    )}
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>Beskriv hvilke roller som skal ha tilgang</FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene && (
                        <BodyShort>
                          {fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene}
                        </BodyShort>
                      )}
                      {!fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene && (
                        <BodyShort>Ikke besvart</BodyShort>
                      )}
                    </FormSummary.Value>
                  </FormSummary.Answer>
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Value>
                <FormSummary.Answers>
                  <FormSummary.Answer>
                    <FormSummary.Label>
                      Beskriv hvordan og hvor lenge personopplysningene skal lagres
                    </FormSummary.Label>
                    <FormSummary.Value>
                      {fieldProp.form.values.lagringsBeskrivelsePersonopplysningene && (
                        <BodyShort>
                          {fieldProp.form.values.lagringsBeskrivelsePersonopplysningene}
                        </BodyShort>
                      )}
                    </FormSummary.Value>
                    <FormSummary.Value>
                      {!fieldProp.form.values.lagringsBeskrivelsePersonopplysningene && (
                        <BodyShort>Ikke besvart</BodyShort>
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
export default ArtOgOmFangSummary
