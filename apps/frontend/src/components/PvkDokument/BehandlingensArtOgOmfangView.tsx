import { Alert, Button, Heading, Link, List, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { IPvkDokument, IPvoTilbakemelding, TEtterlevelseDokumentasjonQL } from '../../constants'
import PvoSidePanelWrapper from '../PvoTilbakemelding/common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from '../PvoTilbakemelding/common/PvoTilbakemeldingReadOnly'
import { BoolField, TextAreaField } from '../common/Inputs'
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
  pvoTilbakemelding?: IPvoTilbakemelding
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
    pvoTilbakemelding,
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

  return (
    <div className='w-full'>
      <div className='flex w-full'>
        <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
            initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
            innerRef={formRef}
          >
            {({ submitForm }) => (
              <Form>
                <div className='flex justify-center'>
                  <div>
                    <Heading level='1' size='medium' className='mb-5'>
                      Behandlingens art og omfang
                    </Heading>

                    <List
                      headingTag='label'
                      title='I Behandlingskatalogen står det at dere behandler personopplysninger om:'
                    >
                      {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                      {personkategorier.length > 0 &&
                        personkategorier.map((personkategori) => (
                          <List.Item key={personkategori}>{personkategori}</List.Item>
                        ))}
                    </List>

                    <BoolField
                      label='Stemmer denne lista over personkategorier?'
                      name='stemmerPersonkategorier'
                      horizontal
                    />

                    <Field>
                      {(fieldProps: FieldProps) => (
                        <>
                          {fieldProps.form.values.stemmerPersonkategorier === false && (
                            <div className='max-w-[75ch]'>
                              <Alert inline variant='warning' className='mt-5 mb-10'>
                                Dere må oppdatere personkategori(er) i Behandlingskatalogen. Hvis
                                dere ikke finner riktig personkategori(er), ta kontakt på{' '}
                                <Link
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  href='https://nav-it.slack.com/archives/CR1B19E6L'
                                  className='inline'
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
                      className='mt-5 max-w-[75ch]'
                      header='Hvordan kan vi komme med gode estimater på art og omfang?'
                    >
                      Art og omfang skal hjelpe oss å vurdere risiko. Det er ofte vanskelig å gi
                      presise anslag. Det holder å estimere ca antall.
                      <br />
                      <br />
                      For antall personer vi behandler opplysninger om kan publisert statistikk
                      brukes for å estimere. På spørsmålet om hvem som har tilgang må hele
                      behandlingsløpet vurderes, inkludert f.eks. utviklere av applikasjonen og
                      eventuelle underleverandører.
                    </ReadMore>

                    <div className='mt-5 max-w-[75ch]'>
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label='For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.'
                        name='personkategoriAntallBeskrivelse'
                      />
                    </div>

                    <div className='mt-5 max-w-[75ch]'>
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label='Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.'
                        name='tilgangsBeskrivelsePersonopplysningene'
                      />
                    </div>

                    <div className='mt-5 max-w-[75ch]'>
                      <TextAreaField
                        rows={3}
                        noPlaceholder
                        label='Beskriv hvordan og hvor lenge personopplysningene skal lagres.'
                        name='lagringsBeskrivelsePersonopplysningene'
                      />
                    </div>

                    <div className='mt-5'>
                      <Button
                        type='button'
                        onClick={() => {
                          submitForm()
                        }}
                      >
                        Lagre
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* sidepanel */}

        {pvoTilbakemelding && (
          <PvoSidePanelWrapper>
            <PvoTilbakemeldingReadOnly
              tilbakemeldingsinnhold={pvoTilbakemelding.behandlingensArtOgOmfang}
              sentDate={pvoTilbakemelding.sendtDato}
            />
          </PvoSidePanelWrapper>
        )}
      </div>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}
export default BehandlingensArtOgOmfangView
