import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, CopyButton, Heading } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { EPvkDokumentStatus, IPvkDokument } from '../../constants'
import { user } from '../../services/User'
import { TextAreaField } from '../common/Inputs'
import FormButtons from './edit/FormButtons'
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
  } = props

  const [submitPvkStatus, setSubmitPvkStatus] = useState<EPvkDokumentStatus>(
    EPvkDokumentStatus.UNDERARBEID
  )

  const submit = async (pvkDokument: IPvkDokument) => {
    await getPvkDokument(pvkDokument.id).then((response) => {
      const updatedPvkDokument = {
        ...response,
        status: submitPvkStatus,
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
              />

              <InvolveringSummary
                databehandlere={databehandlere}
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
              />

              <RisikoscenarioSummary />

              <div className="mt-5 mb-3 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)"
                  name="merknadTilPvoEllerRisikoeier"
                />
              </div>

              {(user.isPersonvernombud() || user.isAdmin()) && (
                <div className="mt-5 mb-3 max-w-[75ch]">
                  <TextAreaField
                    rows={3}
                    noPlaceholder
                    label="Er det noe annet dere ønsker å formidle til etterlever? (valgfritt)"
                    name="merknadTilEtterleverEllerRisikoeier"
                  />
                </div>
              )}

              <CopyButton
                variant="action"
                copyText={window.location.href}
                text="Kopiér lenken til denne siden"
                activeText="Lenken er kopiert"
                icon={<FilesIcon aria-hidden />}
              />

              {pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
                <Alert variant="success" className="my-5">
                  Sendt til Personvernombudet
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
                          setSubmitPvkStatus(EPvkDokumentStatus.UNDERARBEID)
                          submitForm()
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={() => {
                        setSubmitPvkStatus(EPvkDokumentStatus.SENDT_TIL_PVO)
                        submitForm()
                      }}
                    >
                      Send til Personvernombudet
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

export default SendInnView
