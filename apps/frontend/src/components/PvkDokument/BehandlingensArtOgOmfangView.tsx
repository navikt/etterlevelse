import { Alert, Heading, List, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { BoolField, TextAreaField } from '../common/Inputs'

interface IProps {
  personkategorier: string[]
}

export const BehandlingensArtOgOmfangView = (props: IProps) => {
  const { personkategorier } = props
  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Behandlingens art og omfang
      </Heading>

      <List title="I Behandlingskatalogen står det at dere behandler personopplysninger om:">
        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
        {personkategorier.length > 0 &&
          personkategorier.map((personkategori) => (
            <List.Item key={personkategori}>{personkategori}</List.Item>
          ))}
      </List>

      <BoolField
        label="Stemmer denne lista over personkategorier?"
        name="stemmerPersonkategorier"
        horizontal
      />

      <Field>
        {(fieldProps: FieldProps) => (
          <>
            {fieldProps.form.values.stemmerPersonkategorier === false && (
              <Alert inline variant="warning" className="mt-3">
                Dere må oppdatere personkategori(er) i Behandlingskatalogen.
              </Alert>
            )}
          </>
        )}
      </Field>

      <ReadMore className="mt-3" header="Hvordan kan vi komme med gode estimater?">
        Det blir ofte vanskelig å tallfeste noen personkategorier, for eksempel når det er snakk om
        antall brukere eller saksbehandlere. Det er tilstrekkelig å oppgi ca. antall. Hvis du er
        usikker på hvor du faktisk finner tall på hvor mange som kan ha tilgang, kan du … [good
        advice goes here]
      </ReadMore>

      <div className="mt-3">
        <TextAreaField
          rows={3}
          noPlaceholder
          label="For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om."
          name="personkategoriAntallBeskrivelse"
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          rows={3}
          noPlaceholder
          label="Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang."
          name="tilgangsBeskrivelsePersonopplysningene"
        />
      </div>

      <div className="mt-3">
        <TextAreaField
          rows={3}
          noPlaceholder
          label="Beskriv hvordan og hvor lenge personopplysningene skal lagres."
          name="lagringsBeskrivelsePersonopplysningene"
        />
      </div>
    </div>
  )
}
export default BehandlingensArtOgOmfangView