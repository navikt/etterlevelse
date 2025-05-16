import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, CopyButton, Heading, Label } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { FunctionComponent, useState } from 'react'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../api/PvoApi'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { TextAreaField } from '../common/Inputs'
import { Markdown } from '../common/Markdown'
import DataTextWrapper from './common/DataTextWrapper'
import PvoFormButtons from './edit/PvoFormButtons'

type TProps = {
  pvkDokument: IPvkDokument
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const SendInnPvoView: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
}) => {
  const [submittedStatus, setSubmittedStatus] = useState<EPvoTilbakemeldingStatus>(
    EPvoTilbakemeldingStatus.UNDERARBEID
  )

  const submit = async (submittedValues: IPvoTilbakemelding): Promise<void> => {
    //backend vil oppdatere statusen til PVk dokument til 'VURDERT_AV_PVO', dersom statusen til PVO tilbakemelding = 'FERDIG'
    await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
      .then(async (response: IPvoTilbakemelding) => {
        if (response) {
          const updatedValues: IPvoTilbakemelding = {
            ...response,
            status: submittedStatus,
            avventer: false,
            sendtDato:
              submittedStatus === EPvoTilbakemeldingStatus.FERDIG ? new Date().toISOString() : '',
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
            avventer: false,
            sendtDato:
              submittedStatus === EPvoTilbakemeldingStatus.FERDIG ? new Date().toISOString() : '',
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
          <div className='pt-6 flex justify-center'>
            <div>
              <Heading level='1' size='medium' className='mb-5'>
                Send tilbakemelding til etterlever
              </Heading>

              {pvkDokument.merknadTilPvoEllerRisikoeier &&
                pvkDokument.merknadTilPvoEllerRisikoeier.length > 0 && (
                  <div className='mt-5 mb-3 max-w-[75ch]'>
                    <Label>Beskjed fra etterlever</Label>
                    <DataTextWrapper>{pvkDokument.merknadTilPvoEllerRisikoeier}</DataTextWrapper>
                  </div>
                )}

              {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                <div className='mt-5 mb-3 max-w-[75ch]'>
                  <TextAreaField
                    rows={3}
                    noPlaceholder
                    label='Er det noe annet dere ønsker å formidle til etterlever? (valgfritt)'
                    name='merknadTilEtterleverEllerRisikoeier'
                  />
                </div>
              )}

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <div className='mt-5 mb-3 max-w-[75ch]'>
                  <Label>Tilbakemelding til etterlever</Label>

                  {pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier &&
                    pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length !== 0 && (
                      <Markdown source={pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier} />
                    )}
                  <BodyLong>
                    {(!pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier ||
                      pvoTilbakemelding.merknadTilEtterleverEllerRisikoeier.length === 0) &&
                      'Ingen tilbakemelding til etterlever'}
                  </BodyLong>
                </div>
              )}

              <CopyButton
                variant='action'
                copyText={window.location.href}
                text='Kopiér lenken til denne siden'
                activeText='Lenken er kopiert'
                icon={<FilesIcon aria-hidden />}
              />

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <Alert variant='success' className='my-5'>
                  Tilbakemelding er sendt
                </Alert>
              )}

              <PvoFormButtons
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                setSelectedStep={setSelectedStep}
                submitForm={submitForm}
                customButtons={
                  <div className='mt-5 flex gap-2 items-center'>
                    {!dirty && <div className='min-w-[223px]'></div>}
                    {dirty && (
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() => {
                          setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                          submitForm()
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>
                    )}

                    {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                      <Button
                        type='button'
                        onClick={() => {
                          setSubmittedStatus(EPvoTilbakemeldingStatus.FERDIG)
                          submitForm()
                        }}
                      >
                        Send tilbakemelding
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

export default SendInnPvoView
