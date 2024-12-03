import { Alert, Heading, Link, List, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { IPvkDokument, TEtterlevelseDokumentasjonQL } from '../../constants'
import { BoolField, TextAreaField } from '../common/Inputs'
import FormButtons from './edit/FormButtons'

interface IProps {
  personkategorier: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  setPvkDokument: (pvkDokument: IPvkDokument) => void
  activeStep: number
  setActiveStep: (step: number) => void
}

export const BehandlingensArtOgOmfangView = (props: IProps) => {
  const {
    personkategorier,
    etterlevelseDokumentasjon,
    pvkDokument,
    setPvkDokument,
    activeStep,
    setActiveStep,
  } = props

  const submit = async (pvkDokument: IPvkDokument) => {
    getPvkDokument(pvkDokument.id).then(async (response) => {
      const updatedatePvkDokument = {
        ...response,
        stemmerPersonkategorier: pvkDokument.stemmerPersonkategorier,
        personkategoriAntallBeskrivelse: pvkDokument.personkategoriAntallBeskrivelse,
        tilgangsBeskrivelsePersonopplysningene: pvkDokument.tilgangsBeskrivelsePersonopplysningene,
        lagringsBeskrivelsePersonopplysningene: pvkDokument.lagringsBeskrivelsePersonopplysningene,
      }
      await updatePvkDokument(updatedatePvkDokument).then((response) => {
        setPvkDokument(response)
      })
    })
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
    >
      {({ submitForm }) => (
        <Form>
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
                  <Alert inline variant="warning" className="mt-5 mb-10">
                    Dere må oppdatere personkategori(er) i Behandlingskatalogen. Hvis dere ikke
                    finner riktig personkategori(er), ta kontakt på{' '}
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://nav-it.slack.com/archives/CR1B19E6L"
                    >
                      #behandlingskatalogen på Slack (åpnes i ny fane)
                    </Link>
                    , eller på epost: teamdatajegerne@nav.no.
                  </Alert>
                )}
              </>
            )}
          </Field>

          <ReadMore className="mt-5" header="Hvordan kan vi komme med gode estimater?">
            Det blir ofte vanskelig å tallfeste noen personkategorier, for eksempel når det er snakk
            om antall brukere eller saksbehandlere. Det er tilstrekkelig å oppgi ca. antall. Hvis du
            er usikker på hvor du faktisk finner tall på hvor mange som kan ha tilgang, kan du …
            [good advice goes here]
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

          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            submitForm={submitForm}
          />
        </Form>
      )}
    </Formik>
  )
}
export default BehandlingensArtOgOmfangView
