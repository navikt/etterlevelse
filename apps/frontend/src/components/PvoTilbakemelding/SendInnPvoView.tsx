import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, CopyButton, Heading, Label } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../api/PvoApi'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import FormButtons from '../PvkDokument/edit/FormButtons'
import ArtOgOmFangSummary from '../PvkDokument/formSummary/ArtOgOmfangSummary'
import InvolveringSummary from '../PvkDokument/formSummary/InvolveringSummary'
import RisikoscenarioSummary from '../PvkDokument/formSummary/RisikoscenarioSummary'
import { TextAreaField } from '../common/Inputs'

interface IProps {
  pvkDokument: IPvkDokument
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjonId: string
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const SendInnPvoView = (props: IProps) => {
  const {
    pvkDokument,
    pvoTilbakemelding,
    updateTitleUrlAndStep,
    personkategorier,
    databehandlere,
    etterlevelseDokumentasjonId,
    activeStep,
    setActiveStep,
    setSelectedStep,
  } = props

  const [submittedStatus, setSubmittedStatus] = useState<EPvoTilbakemeldingStatus>(
    EPvoTilbakemeldingStatus.UNDERARBEID
  )

  const submit = async (submittedValues: IPvoTilbakemelding) => {
    await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
      .then(async (response) => {
        if (response) {
          const updatedValues: IPvoTilbakemelding = {
            ...response,
            status: submittedStatus,
            merknadTilEtterleverEllerRisikoeier:
              submittedValues.merknadTilEtterleverEllerRisikoeier,
          }
          await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
        }
      })
      .catch(async (error: AxiosError) => {
        if (error.status === 404) {
          const createValue = mapPvoTilbakemeldingToFormValue({
            pvkDokumentId: pvkDokument.id,
            status: submittedStatus,
            merknadTilEtterleverEllerRisikoeier:
              submittedValues.merknadTilEtterleverEllerRisikoeier,
          })
          await createPvoTilbakemelding(createValue).then(() => window.location.reload())
        } else {
          console.debug(error)
        }
      })
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvoTilbakemeldingToFormValue(pvoTilbakemelding)}
    >
      {({ submitForm, dirty }) => (
        <Form>
          <div className="flex justify-center">
            <div>
              <Heading level="1" size="medium" className="mb-5">
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
                customLinktext="Endre tilbakemelding"
              />

              <InvolveringSummary
                databehandlere={databehandlere}
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
                customLinktext="Endre tilbakemelding"
              />

              <RisikoscenarioSummary />

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>
                  Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)
                </Label>
                <BodyLong>{pvkDokument.merknadTilPvoEllerRisikoeier}</BodyLong>
              </div>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Er det noe annet dere ønsker å formidle til etterlever? (valgfritt)"
                  name="merknadTilEtterleverEllerRisikoeier"
                />
              </div>

              <CopyButton
                variant="action"
                copyText={window.location.href}
                text="Kopiér lenken til denne siden"
                activeText="Lenken er kopiert"
                icon={<FilesIcon aria-hidden />}
              />

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <Alert variant="success" className="my-5">
                  Tilbakemelding er sendt
                </Alert>
              )}

              <FormButtons
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                setSelectedStep={setSelectedStep}
                submitForm={submitForm}
                customButtons={
                  <div className="mt-5 flex gap-2 items-center">
                    {dirty && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                          submitForm()
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => {
                        setSubmittedStatus(EPvoTilbakemeldingStatus.FERDIG)
                        submitForm()
                      }}
                    >
                      Send tilbakemelding
                    </Button>
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

export default SendInnPvoView
