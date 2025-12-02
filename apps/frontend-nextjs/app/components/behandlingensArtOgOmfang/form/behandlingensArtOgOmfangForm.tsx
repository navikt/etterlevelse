import {
  createBehandlingensArtOgOmfang,
  getBehandlingensArtOgOmfangByEtterlevelseDokumentId,
  mapBehandlingensArtOgOmfangToFormValue,
  updateBehandlingensArtOgOmfang,
} from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import InfoChangesMadeAfterApproval from '@/components/PVK/common/infoChangesMadeAfterApproval'
import { BoolField } from '@/components/common/inputs'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVK,
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { dokumentasjonUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Heading, Label, List, Modal, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import Link from 'next/link'
import { FunctionComponent, RefObject, useState } from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  personkategorier: string[]
  artOgOmfang: IBehandlingensArtOgOmfang
  setArtOgOmfang: (state: IBehandlingensArtOgOmfang) => void
  savedSuccessful: boolean
  setSavedSuccessful: (state: boolean) => void
  setIsPvoAlertModalOpen: (state: boolean) => void
  formRef: RefObject<any>
  pvkDokument?: IPvkDokument
}

export const BehandlingensArtOgOmfangForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  personkategorier,
  artOgOmfang,
  setArtOgOmfang,
  pvkDokument,
  savedSuccessful,
  setSavedSuccessful,
  setIsPvoAlertModalOpen,
  formRef,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isNullStilModalOpen, setIsNullStilModalOpen] = useState<boolean>(false)

  const submit = async (submitedValues: any) => {
    if (etterlevelseDokumentasjon) {
      const mutatedArtOgOmfang = {
        ...submitedValues,
        etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
      } as IBehandlingensArtOgOmfang

      //double check if behandlings art og omfang already exist before submitting
      let existingArtOgOmfangId = ''
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
          await updateBehandlingensArtOgOmfang(mutatedArtOgOmfang).then(async (response) => {
            setArtOgOmfang(response)
            await formRef.current.resetForm({
              values: mapBehandlingensArtOgOmfangToFormValue(response),
            })
            setSavedSuccessful(true)
          })
        } else {
          await createBehandlingensArtOgOmfang(mutatedArtOgOmfang).then(async (response) => {
            setArtOgOmfang(response)

            window.history.pushState(
              { savedAlert: true, pvkDokument: response },
              '',
              `${dokumentasjonUrl}/${response.etterlevelseDokumentasjonId}/behandlingens-art-og-omfang/${response.id}`
            )

            await formRef.current.resetForm({
              values: mapBehandlingensArtOgOmfangToFormValue(response),
            })
            setSavedSuccessful(true)
          })
        }
      }
    }
  }

  return (
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
                          Dere må oppdatere personkategori(er) i Behandlingskatalogen. Hvis dere
                          ikke finner riktig personkategori(er), ta kontakt på{' '}
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
                Art og omfang skal hjelpe oss å vurdere risiko. Det er ofte vanskelig å gi presise
                anslag. Det holder å estimere ca antall.
                <br />
                <br />
                For antall personer vi behandler opplysninger om kan publisert statistikk brukes for
                å estimere. På spørsmålet om hvem som har tilgang må hele behandlingsløpet vurderes,
                inkludert f.eks. utviklere av applikasjonen og eventuelle underleverandører.
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
                  <Alert variant='success' closeButton onClose={() => setSavedSuccessful(false)}>
                    Lagring vellykket
                  </Alert>
                </div>
              )}

              {pvkDokument && <InfoChangesMadeAfterApproval pvkDokument={pvkDokument} />}

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
                  header={{
                    heading: 'Er du sikker på at du vil nullstille svarene?',
                    icon: <ExclamationmarkTriangleIcon />,
                  }}
                >
                  <Modal.Body>
                    <BodyLong>
                      Når du nullstiller svar, vil alle felt på denne siden tommes og endringen
                      lagres. Det vil ikke være mulig å gjenopprette svar du har lagret tidligere.
                      Som alternativ er det mulig å velge:
                    </BodyLong>
                    <List as='ul'>
                      <List.Item>
                        Forkast endringer, som tilbakestiller svarene slik de så ut siste gang de
                        ble lagret.
                      </List.Item>
                      <List.Item>Avbryt, og manuelt fjerne enkelte svar selv.</List.Item>
                    </List>
                  </Modal.Body>
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
                      Nullstill svar
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => {
                        resetForm()
                        setIsNullStilModalOpen(false)
                      }}
                    >
                      Forkast ulagrede endringer
                    </Button>
                    <Button
                      type='button'
                      variant='tertiary'
                      onClick={() => {
                        setIsNullStilModalOpen(false)
                      }}
                    >
                      Avbryt
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
  )
}

export default BehandlingensArtOgOmfangForm
