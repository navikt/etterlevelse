import {
  Alert,
  BodyLong,
  Button,
  Heading,
  Label,
  Link,
  List,
  Radio,
  RadioGroup,
  ReadMore,
  ToggleGroup,
} from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject, useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { IPvkDokument, TEtterlevelseDokumentasjonQL } from '../../constants'
import { BoolField, TextAreaField } from '../common/Inputs'
import { Markdown } from '../common/Markdown'
import TextEditor from '../common/TextEditor/TextEditor'
import FormButtons from './edit/FormButtons'

interface IProps {
  personkategorier: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  setPvkDokument: (pvkDokument: IPvkDokument) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangView = (props: IProps) => {
  const {
    personkategorier,
    etterlevelseDokumentasjon,
    pvkDokument,
    setPvkDokument,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
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
      await updatePvkDokument(updatedatePvkDokument).then((response: IPvkDokument) => {
        setPvkDokument(response)
        window.location.reload()
      })
    })
  }

  const [mode, setMode] = useState('edit')
  const [value, setValue] = useState('')

  return (
    <div className="flex w-full">
      <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8">
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={submit}
          initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
          innerRef={formRef}
        >
          {({ submitForm }) => (
            <Form>
              <div className="flex justify-center">
                <div>
                  <Heading level="1" size="medium" className="mb-5">
                    Behandlingens art og omfang
                  </Heading>
                  {pvkDokument.changeStamp.lastModifiedBy && (
                    <div className="mt-5 mb-10">
                      {'Sist redigert av: ' + pvkDokument.changeStamp.lastModifiedBy}
                    </div>
                  )}

                  <List
                    headingTag="label"
                    title="I Behandlingskatalogen står det at dere behandler personopplysninger om:"
                  >
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
                          <div className="max-w-[75ch]">
                            <Alert inline variant="warning" className="mt-5 mb-10">
                              Dere må oppdatere personkategori(er) i Behandlingskatalogen. Hvis dere
                              ikke finner riktig personkategori(er), ta kontakt på{' '}
                              <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://nav-it.slack.com/archives/CR1B19E6L"
                                className="inline"
                              >
                                #behandlingskatalogen på Slack (åpner i en ny fane)
                              </Link>
                              , eller på epost: teamdatajegerne@nav.no.
                            </Alert>
                          </div>
                        )}
                      </>
                    )}
                  </Field>

                  <ReadMore
                    className="mt-5 max-w-[75ch]"
                    header="Hvordan kan vi komme med gode estimater på art og omfang?"
                  >
                    Det blir ofte vanskelig å tallfeste noen personkategorier, for eksempel når det
                    er snakk om antall brukere eller saksbehandlere. Det er tilstrekkelig å oppgi
                    ca. antall.
                  </ReadMore>

                  <div className="mt-5 max-w-[75ch]">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om."
                      name="personkategoriAntallBeskrivelse"
                    />
                  </div>

                  <div className="mt-5 max-w-[75ch]">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang."
                      name="tilgangsBeskrivelsePersonopplysningene"
                    />
                  </div>

                  <div className="mt-5 max-w-[75ch]">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="Beskriv hvordan og hvor lenge personopplysningene skal lagres."
                      name="lagringsBeskrivelsePersonopplysningene"
                    />
                  </div>

                  <div className="mt-5">
                    <Button
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      Lagre
                    </Button>
                  </div>

                  <FormButtons
                    etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    setSelectedStep={setSelectedStep}
                    submitForm={submitForm}
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <div className="px-4 py-4 border-l border-[#071a3636] w-full max-w-md bg-[#F0EEF4] mt-35">
        {pvkDokument.changeStamp.lastModifiedBy && (
          <div className="mt-5 mb-10">
            {'Sist redigert av: ' + pvkDokument.changeStamp.lastModifiedBy}
          </div>
        )}

        <div>
          <RadioGroup
            legend="Vurdér om etterleverens bidrag er tilstrekkelig"
            // onChange={handleChange}
            description="Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen."
          >
            <Radio value="JA">Ja, tilstrekkelig </Radio>
            <Radio value="Tilstrekkelig">
              Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives
              i fritekst under
            </Radio>
            <Radio value="40">Utilstrekkelig, beskrives nærmere under</Radio>
          </RadioGroup>
        </div>

        <div className="my-5">
          <Label>Skriv intern PVO diskusjon her</Label>
          <BodyLong>Denne teksten er privat for PVO og skal ikke deles med etterleveren</BodyLong>
        </div>

        <div>
          {mode === 'edit' && (
            <TextEditor
              initialValue={value}
              setValue={setValue}
              height="15.625rem"
              // setIsFormDirty={setIsFormDirty}
            />
          )}

          {mode === 'view' && (
            <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
              <Markdown source={''} />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-[-1px]">
          <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
            <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
            <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
          </ToggleGroup>
        </div>

        <div className="my-5">
          <Label>Skriv tilbakemelding til etterleveren</Label>
          <BodyLong>
            Tilbakemeldingen blir ikke tilgjengelig for etterleveren før du velger å publisere
            den.{' '}
          </BodyLong>
        </div>
        <div>
          {mode === 'edit' && (
            <TextEditor
              initialValue={value}
              setValue={setValue}
              height="15.625rem"
              // setIsFormDirty={setIsFormDirty}
            />
          )}

          {mode === 'view' && (
            <div className="p-8 border-border-subtle-hover border border-solid rounded-md bg-white">
              <Markdown source={''} />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-[-1px]">
          <ToggleGroup defaultValue="edit" onChange={setMode} size="small">
            <ToggleGroup.Item value="edit">Redigering</ToggleGroup.Item>
            <ToggleGroup.Item value="view">Forhåndsvisning</ToggleGroup.Item>
          </ToggleGroup>
        </div>

        <div className="mt-10 flex flex-row gap-2">
          <div>
            <Button
              size="small"
              onClick={() => {
                setValue('')
              }}
            >
              Lagre
            </Button>
          </div>
          <div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setValue('')
              }}
            >
              Avbryt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BehandlingensArtOgOmfangView
