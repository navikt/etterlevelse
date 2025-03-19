import { Button, Label } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../api/PvoApi'
import { EPVK, EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import {
  SendInnViewArtInvRisCommon,
  SendInnViewCopySendCommon,
} from '../PvkCommon/SendInnViewCommon'
import FormButtons from '../PvkDokument/edit/FormButtons'
import { TextAreaField } from '../common/Inputs'
import DataTextWrapper from './common/DataTextWrapper'

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
          <div className="pt-6 flex justify-center">
            <div>
              <SendInnViewArtInvRisCommon
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
                databehandlere={databehandlere}
              />

              <div className="mt-5 mb-3 max-w-[75ch]">
                <Label>
                  {EPVK.tilbakemelding} {EPVK.pvk}? (valgfritt)
                </Label>
                <DataTextWrapper>{pvkDokument.merknadTilPvoEllerRisikoeier}</DataTextWrapper>
              </div>

              <div className="mt-5 mb-3 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label={`${EPVK.tilbakemelding} etterlever? (valgfritt)`}
                  name="merknadTilEtterleverEllerRisikoeier"
                />
              </div>

              <SendInnViewCopySendCommon pvkDokument={pvkDokument} />

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
