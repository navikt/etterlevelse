'use client'

import {
  createBehandlingensArtOgOmfang,
  getBehandlingensArtOgOmfangByEtterlevelseDokumentId,
  mapBehandlingensArtOgOmfangToFormValue,
  updateBehandlingensArtOgOmfang,
  useBehandlingensArtOgOmfang,
} from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import InfoChangesMadeAfterApproval from '@/components/PVK/common/infoChangesMadeAfterApproval'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { BoolField } from '@/components/common/inputs'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ContentLayout } from '@/components/others/layout/content/content'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVK,
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button, Heading, Label, Link, List, Modal, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useState } from 'react'

type TProps = {
  personkategorier: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const BehandlingensArtOgOmfangView: FunctionComponent<TProps> = ({
  personkategorier,
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const [artOgOmfang, setArtOgOmfang, loading] = useBehandlingensArtOgOmfang(
    etterlevelseDokumentasjon.id
  )

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isNullStilModalOpen, setIsNullStilModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (submitedValues: IBehandlingensArtOgOmfang): Promise<void> => {
    if (etterlevelseDokumentasjon) {
      const mutatedArtOgOmfang = {
        ...submitedValues,
        etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
      } as IBehandlingensArtOgOmfang

      //double check if behandlingensArtOgOmfang already exist before submitting
      let existingArtOgOmfangId: string = ''
      const existingArtOgOmfang = await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(
        etterlevelseDokumentasjon.id
      ).catch(() => undefined)

      if (existingArtOgOmfang) {
        existingArtOgOmfangId = existingArtOgOmfang.id
        mutatedArtOgOmfang.id = existingArtOgOmfang.id
      }

      let pvkStatus = ''
      await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then((response) => {
          pvkStatus = response.status
        })
        .catch(() => undefined)

      if (isReadOnlyPvkStatus(pvkStatus as EPvkDokumentStatus)) {
        setIsPvoAlertModalOpen(true)
      } else {
        if (submitedValues.id || existingArtOgOmfangId) {
          await updateBehandlingensArtOgOmfang(mutatedArtOgOmfang).then(
            (response: IBehandlingensArtOgOmfang) => {
              setArtOgOmfang(response)
              formRef.current.resetForm({
                values: mapBehandlingensArtOgOmfangToFormValue(response),
              })
              setSavedSuccessful(true)
            }
          )
        } else {
          await createBehandlingensArtOgOmfang(mutatedArtOgOmfang).then(
            (response: IBehandlingensArtOgOmfang) => {
              setArtOgOmfang(response)
              formRef.current.resetForm({
                values: mapBehandlingensArtOgOmfangToFormValue(response),
              })
              setSavedSuccessful(true)
            }
          )
        }
      }
    }
  }

  return (
    <div className='w-full'>
      <ContentLayout>
        {loading && <CenteredLoader />}

        {!loading && artOgOmfang && !isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={submit}
              initialValues={mapBehandlingensArtOgOmfangToFormValue(
                artOgOmfang as IBehandlingensArtOgOmfang
              )}
              innerRef={formRef}
            >
              {({ submitForm, values, resetForm, setFieldValue, initialValues, dirty }) => (
                <Form>
                  <div className='flex justify-center'>
                    <div className='max-w-[75ch] w-full'>
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
                              <div>
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
                        className='mt-5'
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

                      <div className='mt-5'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label='2. For hver av personkategoriene over, beskriv hvor mange personer dere behandler personopplysninger om.'
                          name='personkategoriAntallBeskrivelse'
                        />
                      </div>

                      <div className='mt-5'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label='3. Beskriv hvilke roller som skal ha tilgang til personopplysningene. For hver av rollene, beskriv hvor mange som har tilgang.'
                          name='tilgangsBeskrivelsePersonopplysningene'
                        />
                      </div>

                      <div className='mt-5'>
                        <TextAreaField
                          rows={3}
                          noPlaceholder
                          label='4. Beskriv hvordan og hvor lenge personopplysningene skal lagres.'
                          name='lagringsBeskrivelsePersonopplysningene'
                        />
                      </div>

                      {savedSuccessful && !dirty && (
                        <div className='mt-5'>
                          <Alert
                            variant='success'
                            closeButton
                            onClose={() => setSavedSuccessful(false)}
                          >
                            Lagring vellykket
                          </Alert>
                        </div>
                      )}

                      <InfoChangesMadeAfterApproval pvkDokument={pvkDokument} />

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
                                      ...artOgOmfang,
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
            <AlertPvoUnderArbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          </div>
        )}

        {!loading && artOgOmfang && isReadOnlyPvkStatus(pvkDokument.status) && (
          <ArtOgOmfangReadOnlyContent
            artOgOmfang={artOgOmfang}
            personkategorier={personkategorier}
          />
        )}

        {/* sidepanel */}
        {pvoTilbakemelding &&
          pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG &&
          relevantVurdering && (
            <div>
              <PvkSidePanelWrapper>
                <PvoTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.behandlingensArtOgOmfang}
                  sentDate={relevantVurdering.sendtDato}
                />
              </PvkSidePanelWrapper>
            </div>
          )}
      </ContentLayout>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default BehandlingensArtOgOmfangView
