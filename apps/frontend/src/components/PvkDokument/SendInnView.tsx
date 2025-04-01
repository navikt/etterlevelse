import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, CopyButton, ErrorSummary, Heading, Label } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useRef } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { EPvkDokumentStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import DataTextWrapper from '../PvoTilbakemelding/common/DataTextWrapper'
import { TextAreaField } from '../common/Inputs'
import FormButtons from './edit/FormButtons'
import pvkDocumentSchema from './edit/pvkDocumentSchema'
import ArtOgOmFangSummary from './formSummary/ArtOgOmfangSummary'
import InvolveringSummary from './formSummary/InvolveringSummary'
import RisikoscenarioSummary from './formSummary/RisikoscenarioSummary'

interface IProps {
  pvkDokument: IPvkDokument
  setPvkDokument: (state: IPvkDokument) => void
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const SendInnView = (props: IProps) => {
  const {
    pvkDokument,
    setPvkDokument,
    updateTitleUrlAndStep,
    personkategorier,
    databehandlere,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
    pvoTilbakemelding,
  } = props
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  const underarbeidCheck =
    pvkDokument.status === EPvkDokumentStatus.UNDERARBEID ||
    pvkDokument.status === EPvkDokumentStatus.AKTIV

  const submit = async (pvkDokument: IPvkDokument) => {
    await getPvkDokument(pvkDokument.id).then((response) => {
      const updatedStatus =
        pvkDokument.status !== EPvkDokumentStatus.VURDERT_AV_PVO &&
        pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
        (response.status === EPvkDokumentStatus.VURDERT_AV_PVO ||
          response.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
          ? response.status
          : pvkDokument.status

      const updatedPvkDokument = {
        ...response,
        status: updatedStatus,
        merknadTilPvoEllerRisikoeier: pvkDokument.merknadTilPvoEllerRisikoeier,
      }

      updatePvkDokument(updatedPvkDokument).then((savedResponse) => {
        setPvkDokument(savedResponse)
      })
    })
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
      validationSchema={pvkDocumentSchema}
    >
      {({ setFieldValue, submitForm, dirty, errors }) => (
        <Form>
          <div className='flex justify-center'>
            <div>
              <Heading level='1' size='medium' className='mb-5'>
                Les og send inn
              </Heading>
              <BodyLong>
                Her kan dere lese over det som er lagt inn i PVK-en. Hvis dere oppdager feil eller
                mangel, er det mulig å gå tilbake og endre svar. Til slutt er det plass til å legge
                til ytterligere informasjon dersom det er aktuelt.
              </BodyLong>

              <ArtOgOmFangSummary
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
              />

              <InvolveringSummary
                databehandlere={databehandlere}
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
              />

              <RisikoscenarioSummary />

              {underarbeidCheck && (
                <div className='mt-5 mb-3 max-w-[75ch]'>
                  <TextAreaField
                    rows={3}
                    noPlaceholder
                    label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
                    name='merknadTilPvoEllerRisikoeier'
                  />
                </div>
              )}

              {pvoTilbakemelding &&
                (pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO ||
                  pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) && (
                  <div>
                    <div className='mt-5 mb-3 max-w-[75ch]'>
                      <Label>Beskjed til personvernombudet</Label>
                      <DataTextWrapper>
                        {pvkDokument.merknadTilPvoEllerRisikoeier
                          ? pvkDokument.merknadTilPvoEllerRisikoeier
                          : 'Ingen beskjed'}
                      </DataTextWrapper>
                    </div>
                    <div className='mt-5 mb-3 max-w-[75ch]'>
                      <Label>Beskjed til etterlever</Label>
                      <DataTextWrapper>
                        {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
                          ? pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier
                          : 'Ingen beskjed'}
                      </DataTextWrapper>
                    </div>
                  </div>
                )}

              <CopyButton
                variant='action'
                copyText={window.location.href}
                text='Kopiér lenken til denne siden'
                activeText='Lenken er kopiert'
                icon={<FilesIcon aria-hidden />}
              />

              {pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
                <Alert variant='success' className='my-5'>
                  Sendt til Personvernombudet
                </Alert>
              )}

              {Object.values(errors).some(Boolean) && (
                <ErrorSummary
                  ref={errorSummaryRef}
                  heading='Du må rette disse feilene før du kan fortsette'
                >
                  {Object.entries(errors)
                    .filter(([, error]) => error)
                    .map(([key, error]) => (
                      <ErrorSummary.Item href={`#${key}`} key={key}>
                        {error as string}
                      </ErrorSummary.Item>
                    ))}
                </ErrorSummary>
              )}

              <FormButtons
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                setSelectedStep={setSelectedStep}
                submitForm={submitForm}
                customButtons={
                  <div className='mt-5 flex gap-2 items-center'>
                    {dirty && (
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={async () => {
                          if (
                            pvkDokument.status !== EPvkDokumentStatus.VURDERT_AV_PVO &&
                            pvkDokument.status !== EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
                          ) {
                            await setFieldValue('status', EPvkDokumentStatus.UNDERARBEID)
                          } else {
                            await setFieldValue('status', pvkDokument.status)
                          }
                          submitForm()
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>
                    )}

                    {underarbeidCheck && (
                      <Button
                        type='button'
                        onClick={async () => {
                          await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO)
                          errorSummaryRef.current?.focus()
                          submitForm()
                        }}
                      >
                        Send til Personvernombudet
                      </Button>
                    )}

                    {pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && (
                      <Button
                        type='button'
                        onClick={async () => {
                          await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO)
                          submitForm()
                        }}
                      >
                        Angre godkjenning
                      </Button>
                    )}

                    {pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && (
                      <Button
                        type='button'
                        onClick={async () => {
                          await setFieldValue('status', EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
                          submitForm()
                        }}
                      >
                        Godkjent
                      </Button>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SendInnView
