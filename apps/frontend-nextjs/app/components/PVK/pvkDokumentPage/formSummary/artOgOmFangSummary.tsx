import { EPVK } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { BodyShort, FormSummary, List } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { FunctionComponent } from 'react'
import { StepTitle } from '../pvkDokumentPage'
import FormAlert from './formAlert'

type TProps = {
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  customLinktext?: string
  customStepNumber?: number
}

export const ArtOgOmFangSummary: FunctionComponent<TProps> = ({
  updateTitleUrlAndStep,
  personkategorier,
  customLinktext,
  customStepNumber,
}) => (
  <Field>
    {(fieldProp: FieldProps) => (
      <FormSummary className='my-3'>
        <FormSummary.Header>
          <FormSummary.Heading level='2'>{StepTitle[2]}</FormSummary.Heading>
          <FormSummary.EditLink
            className='cursor-pointer'
            onClick={() => updateTitleUrlAndStep(customStepNumber ? customStepNumber : 3)}
            href={
              window.location.pathname + '?steg=' + `${customStepNumber ? customStepNumber : 3}`
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
                  <FormSummary.Label id='stemmerPersonkategorier'>
                    Stemmer disse personkategoriene?
                  </FormSummary.Label>
                  <FormSummary.Value>
                    {!fieldProp.form.errors.stemmerPersonkategorier &&
                      (fieldProp.form.values.stemmerPersonkategorier === undefined ||
                        fieldProp.form.values.stemmerPersonkategorier === null) &&
                      'Ikke besvart'}
                    {fieldProp.form.values.stemmerPersonkategorier === true && 'Ja'}
                    {fieldProp.form.values.stemmerPersonkategorier === false && 'Nei'}
                    {fieldProp.form.errors.stemmerPersonkategorier && (
                      <FormAlert>
                        {fieldProp.form.errors.stemmerPersonkategorier as string}
                      </FormAlert>
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
                  <FormSummary.Label id='personkategoriAntallBeskrivelse'>
                    Beskriv antall personer dere behandler personopplysninger om
                  </FormSummary.Label>
                  <FormSummary.Value>
                    {fieldProp.form.values.personkategoriAntallBeskrivelse && (
                      <BodyShort>{fieldProp.form.values.personkategoriAntallBeskrivelse}</BodyShort>
                    )}
                    {!fieldProp.form.errors.personkategoriAntallBeskrivelse &&
                      !fieldProp.form.values.personkategoriAntallBeskrivelse && (
                        <BodyShort>Ikke besvart</BodyShort>
                      )}
                    {fieldProp.form.errors.personkategoriAntallBeskrivelse && (
                      <FormAlert>
                        {fieldProp.form.errors.personkategoriAntallBeskrivelse as string}
                      </FormAlert>
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
                  <FormSummary.Label id='tilgangsBeskrivelsePersonopplysningene'>
                    Beskriv hvilke roller som skal ha tilgang
                  </FormSummary.Label>
                  <FormSummary.Value>
                    {fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene && (
                      <BodyShort>
                        {fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene}
                      </BodyShort>
                    )}
                    {!fieldProp.form.errors.tilgangsBeskrivelsePersonopplysningene &&
                      !fieldProp.form.values.tilgangsBeskrivelsePersonopplysningene && (
                        <BodyShort>Ikke besvart</BodyShort>
                      )}
                    {fieldProp.form.errors.tilgangsBeskrivelsePersonopplysningene && (
                      <FormAlert>
                        {fieldProp.form.errors.tilgangsBeskrivelsePersonopplysningene as string}
                      </FormAlert>
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
                  <FormSummary.Label id='lagringsBeskrivelsePersonopplysningene'>
                    Beskriv hvordan og hvor lenge personopplysningene skal lagres
                  </FormSummary.Label>
                  <FormSummary.Value>
                    {fieldProp.form.values.lagringsBeskrivelsePersonopplysningene && (
                      <BodyShort>
                        {fieldProp.form.values.lagringsBeskrivelsePersonopplysningene}
                      </BodyShort>
                    )}
                    {!fieldProp.form.errors.lagringsBeskrivelsePersonopplysningene &&
                      !fieldProp.form.values.lagringsBeskrivelsePersonopplysningene && (
                        <BodyShort>Ikke besvart</BodyShort>
                      )}
                    {fieldProp.form.errors.lagringsBeskrivelsePersonopplysningene && (
                      <FormAlert>
                        {fieldProp.form.errors.lagringsBeskrivelsePersonopplysningene as string}
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

export default ArtOgOmFangSummary
