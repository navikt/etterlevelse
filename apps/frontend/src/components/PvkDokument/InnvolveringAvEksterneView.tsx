import { Alert, BodyLong, Button, Heading, List, ReadMore } from '@navikt/ds-react'
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
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  setPvkDokument: (pvkDokument: IPvkDokument) => void
  activeStep: number
  setActiveStep: (step: number) => void
}

export const InnvolveringAvEksterneView = (props: IProps) => {
  const {
    personkategorier,
    databehandlere,
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
        harInvolvertRepresentant: pvkDokument.harInvolvertRepresentant,
        representantInvolveringsBeskrivelse: pvkDokument.representantInvolveringsBeskrivelse,
        stemmerDatabehandlere: pvkDokument.stemmerDatabehandlere,
        harDatabehandlerRepresentantInvolvering:
          pvkDokument.harDatabehandlerRepresentantInvolvering,
        dataBehandlerRepresentantInvolveringBeskrivelse:
          pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
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
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
                Innvolvering av eksterne deltakere
              </Heading>

              <Heading level="2" size="small" className="mb-3">
                Representanter for de registrerte
              </Heading>

              <List
                size="small"
                className="mt-5"
                title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
              >
                {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                {personkategorier.length > 0 &&
                  personkategorier.map((personkategori) => (
                    <List.Item key={personkategori}>{personkategori}</List.Item>
                  ))}
              </List>

              {/* <Alert inline variant="info" className="my-5">
            Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
            Behandlingskatalogen.
          </Alert> */}

              <BodyLong className="my-5">
                Dersom disse typer personopplysninger ikke stemmer, må dere oppdatere
                Behandlingskatalogen.
              </BodyLong>

              <BodyLong>
                Representanter for disse gruppene vil kunne bidra til å belyse hvilke konsekvenser
                en behandling av personopplysninger kan ha for den enkelte. Når vi gjennomfører en
                personvernkonsekvensvurdering (PVK), må vi derfor alltid vurdere om det er behov for
                å involvere en representant for de registrerte.
              </BodyLong>

              <BodyLong className="mt-3">
                Hvis dere er usikre på om behandlingene treffer flere eller færre personkategorier,
                kan det være til hjelp å se på behandlingens livsløp.
              </BodyLong>

              <ReadMore
                className="my-8 max-w-[75ch]"
                header="Slik kan dere involvere de forskjellige gruppene"
              >
                Et eller annet fornuftig råd her om f. eks. høre med Sentral brukerutvalg … osv.
                [Lenke til brosjyre på Navet]
              </ReadMore>

              <div className="mt-3">
                <BoolField
                  label="Har dere involvert en representant for de registrerte?"
                  name="harInvolvertRepresentant"
                  horizontal
                />
              </div>

              <div className="mt-5 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Utdyp hvordan dere har involvert representant(er) for de registrerte"
                  name="representantInvolveringsBeskrivelse"
                />
              </div>

              <List className="mt-10" title="Representanter for databehandlere">
                <BodyLong>
                  I Behandlingskatalogen står det at følgende databehandlere benyttes:
                </BodyLong>
                {databehandlere.length === 0 && <List.Item>Ingen</List.Item>}
                {databehandlere.length > 0 &&
                  databehandlere.map((databehandler) => (
                    <List.Item key={databehandler}>{databehandler}</List.Item>
                  ))}
              </List>

              <BodyLong>
                Hvis dere er usikker på om behandlingene benytter flere eller færre databehandlere,
                kan det være til hjelp å se på behandlingens livsløp.
              </BodyLong>

              <div className="mt-7">
                <BoolField
                  label="Stemmer denne lista over databehandlere?"
                  name="stemmerDatabehandlere"
                  horizontal
                />
              </div>

              <Field>
                {(fieldProps: FieldProps) => (
                  <>
                    {fieldProps.form.values.stemmerDatabehandlere === false && (
                      <Alert inline variant="warning" className="my-5">
                        Dere må oppdatere databehandlere i Behandlingskatalogen
                      </Alert>
                    )}
                  </>
                )}
              </Field>

              <BodyLong className="mt-5">
                Dersom det skal benyttes en databehandler i hele eller deler av behandlingen, skal
                dere som hovedregel inkludere en representant for databehandler i vurderingen av
                personvernkonsekvenser (PVK).
              </BodyLong>

              <ReadMore
                className="mt-3 max-w-[75ch]"
                header="Trenger vi å snakke direkte med databehandlere?"
              >
                Noe her om hvor grensa går, særlig mtp avtaler som NAV kan ha med store aktører — IT
                og Anskaffelse har egne sider som vi ev. kunne lenke til.
              </ReadMore>

              <div className="mt-5">
                <BoolField
                  label="Har dere involvert en representant for databehandlere?"
                  name="harDatabehandlerRepresentantInvolvering"
                  horizontal
                />
              </div>

              <div className="mt-3 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Utdyp hvordan dere har involvert representant(er) for databehandler(e)"
                  name="dataBehandlerRepresentantInvolveringBeskrivelse"
                />
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  onClick={() => {
                    if (submitForm) {
                      submitForm()
                    }
                  }}
                >
                  Lagre
                </Button>
              </div>

              <FormButtons
                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                submitForm={submitForm}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}
export default InnvolveringAvEksterneView
