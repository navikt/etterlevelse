import { Alert, Button, Heading, Label, Link, List, Modal, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import {
  EPVK,
  EPvoTilbakemeldingStatus,
  IPvkDokument,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import PvoTilbakemeldingReadOnly from '../PvoTilbakemelding/common/PvoTilbakemeldingReadOnly'
import { BoolField, TextAreaField } from '../common/Inputs'
import { ContentLayout } from '../layout/layout'
import AlertPvoUnderarbeidModal from './common/AlertPvoUnderarbeidModal'
import { PvkSidePanelWrapper } from './common/PvkSidePanelWrapper'
import { isReadOnlyPvkStatus } from './common/util'
import FormButtons from './edit/FormButtons'
import ArtOgOmfangReadOnlyContent from './readOnly/ArtOgOmfangReadOnlyContent'

type TProps = {
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

export const BehandlingensArtOgOmfangView: FunctionComponent<TProps> = ({
  personkategorier,
  etterlevelseDokumentasjon,
  pvkDokument,
  setPvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isNullStilModalOpen, setIsNullStilModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (pvkDokument: IPvkDokument): Promise<void> => {
    await getPvkDokument(pvkDokument.id).then(async (response: IPvkDokument) => {
      const updatedatePvkDokument = {
        ...response,
        stemmerPersonkategorier: pvkDokument.stemmerPersonkategorier,
        personkategoriAntallBeskrivelse: pvkDokument.personkategoriAntallBeskrivelse,
        tilgangsBeskrivelsePersonopplysningene: pvkDokument.tilgangsBeskrivelsePersonopplysningene,
        lagringsBeskrivelsePersonopplysningene: pvkDokument.lagringsBeskrivelsePersonopplysningene,
      }
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        await updatePvkDokument(updatedatePvkDokument)
          .then((response: IPvkDokument) => {
            setPvkDokument(response)
          })
          .finally(() => setSavedSuccessful(true))
      }
    })
  }

  return (
    <div className='w-full'>
      <ContentLayout>
        {pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={submit}
              initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
              innerRef={formRef}
            >
              {({ submitForm, values, resetForm, setFieldValue, initialValues }) => (
                <Form>
                  <div className='flex justify-center'>
                    <div>
                      <Heading level='1' size='medium' className='mb-5'>
                        Behandlingens art og omfang
                      </Heading>

                      <List>
                        <Label>{EPVK.behandlingAvPersonopplysninger}</Label>
                        {personkategorier.length === 0 && <List.Item>Ingen</List.Item>}
                        {personkategorier.length > 0 &&
                          personkategorier.map((personkategori) => (
                            <List.Item key={personkategori}>{personkategori}</List.Item>
                          ))}
                      </List>

                      <BoolField
                        label='1. Stemmer denne lista over personkategorier?'
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
                          label='2. For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.'
                          name='personkategoriAntallBeskrivelse'
                        />
                      </div>

                      <div className='mt-5 max-w-[75ch]'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label='3. Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.'
                          name='tilgangsBeskrivelsePersonopplysningene'
                        />
                      </div>

                      <div className='mt-5 max-w-[75ch]'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label='4. Beskriv hvordan og hvor lenge personopplysningene skal lagres.'
                          name='lagringsBeskrivelsePersonopplysningene'
                        />
                      </div>

                      {savedSuccessful && (
                        <div className='mt-5'>
                          <Alert
                            variant='success'
                            closeButton
                            onClose={() => setSavedSuccessful(false)}
                          >
                            Lagring vellyket
                          </Alert>
                        </div>
                      )}

                      <div className='mt-5 flex gap-2'>
                        <Button
                          type='button'
                          onClick={async () => {
                            await submitForm()
                            resetForm({ values })
                          }}
                        >
                          Lagre
                        </Button>

                        <Button
                          type='button'
                          variant='secondary'
                          onClick={async () => {
                            setIsModalOpen(true)
                          }}
                        >
                          Forkast endringer
                        </Button>

                        <Button
                          type='button'
                          variant='tertiary'
                          onClick={async () => {
                            setIsNullStilModalOpen(true)
                          }}
                        >
                          Nullstill svar
                        </Button>
                      </div>

                      {isNullStilModalOpen && (
                        <Modal
                          open={isNullStilModalOpen}
                          onClose={() => setIsNullStilModalOpen(false)}
                          header={{ heading: 'Er du sikker på at du vil nullstille svarene?' }}
                        >
                          <Modal.Footer>
                            <Button
                              type='button'
                              onClick={async () => {
                                await setFieldValue('stemmerPersonkategorier', null)
                                await setFieldValue('personkategoriAntallBeskrivelse', '')
                                await setFieldValue('tilgangsBeskrivelsePersonopplysningene', '')
                                await setFieldValue('lagringsBeskrivelsePersonopplysningene', '')
                                await submitForm().then(() => {
                                  resetForm({
                                    values: {
                                      ...pvkDokument,
                                      stemmerPersonkategorier: undefined,
                                      personkategoriAntallBeskrivelse: '',
                                      tilgangsBeskrivelsePersonopplysningene: '',
                                      lagringsBeskrivelsePersonopplysningene: '',
                                    },
                                  })
                                  setIsNullStilModalOpen(false)
                                  setSavedSuccessful(false)
                                })
                              }}
                            >
                              Ja, nullstill
                            </Button>
                            <Button
                              type='button'
                              variant='secondary'
                              onClick={() => {
                                setIsNullStilModalOpen(false)
                              }}
                            >
                              Nei, avbryt
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      )}

                      {isModalOpen && (
                        <Modal
                          open={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                          header={{ heading: 'Er du sikker på at du vil forkaste endringene?' }}
                        >
                          <Modal.Footer>
                            <Button
                              type='button'
                              onClick={() => {
                                resetForm({ values: initialValues })
                                setSavedSuccessful(false)
                                setIsModalOpen(false)
                              }}
                            >
                              Ja
                            </Button>
                            <Button
                              type='button'
                              variant='secondary'
                              onClick={() => {
                                setIsModalOpen(false)
                              }}
                            >
                              Nei
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      )}
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
            <AlertPvoUnderarbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          </div>
        )}

        {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
          <ArtOgOmfangReadOnlyContent
            pvkDokument={pvkDokument}
            personkategorier={personkategorier}
          />
        )}

        {/* sidepanel */}
        {pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <PvkSidePanelWrapper>
            <PvoTilbakemeldingReadOnly
              tilbakemeldingsinnhold={pvoTilbakemelding.behandlingensArtOgOmfang}
              sentDate={pvoTilbakemelding.sendtDato}
            />
          </PvkSidePanelWrapper>
        )}
      </ContentLayout>
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
