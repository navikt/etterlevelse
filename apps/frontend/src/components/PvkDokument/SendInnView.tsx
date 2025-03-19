import { Button } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../api/PvkDokumentApi'
import { EPVK, EPvkDokumentStatus, IPvkDokument } from '../../constants'
import {
  SendInnViewArtInvRisCommon,
  SendInnViewCopySendCommon,
} from '../PvkCommon/SendInnViewCommon'
import { TextAreaField } from '../common/Inputs'
import FormButtons from './edit/FormButtons'

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
              <SendInnViewArtInvRisCommon
                personkategorier={personkategorier}
                updateTitleUrlAndStep={updateTitleUrlAndStep}
                databehandlere={databehandlere}
              />

              <div className="mt-5 mb-3 max-w-[75ch]">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label={`${EPVK.tilbakemelding} ${EPVK.pvk}? (valgfritt)`}
                  name="merknadTilPvoEllerRisikoeier"
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
                      Send til {EPVK.pvk}
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
