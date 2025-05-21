import { FilesIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  CopyButton,
  Heading,
  Label,
  Radio,
  RadioGroup,
} from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, useState } from 'react'
import { getPvkDokument } from '../../api/PvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../api/PvoApi'
import {
  EPvkDokumentStatus,
  EPvoTilbakemeldingStatus,
  IPvkDokument,
  IPvoTilbakemelding,
} from '../../constants'
import { TextAreaField } from '../common/Inputs'
import { Markdown } from '../common/Markdown'
import AlertPvoModal from './common/AlertPvoModal'
import DataTextWrapper from './common/DataTextWrapper'
import PvoFormButtons from './edit/PvoFormButtons'
import { sendInnCheck } from './edit/pvoFromSchema'

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
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)

  const submit = async (submittedValues: IPvoTilbakemelding): Promise<void> => {
    //backend vil oppdatere statusen til PVk dokument til 'SENDT_TIL_PVO', dersom statusen til PVO tilbakemelding = 'ikke påbegynt' eller 'avventer'
    //backend vil oppdatere statusen til PVk dokument til 'VURDERT_AV_PVO', dersom statusen til PVO tilbakemelding = 'FERDIG', 'utgår'
    //backend vil oppdatere statusen til PVk dokument til 'PVO_UNDERARBEID', dersom statusen til PVO tilbakemelding = 'Påbegynt', 'snart ferdig' eller 'til kontroll'

    let pvkStatus = ''

    await getPvkDokument(pvkDokument.id).then((response) => (pvkStatus = response.status))

    if (pvkStatus === EPvkDokumentStatus.UNDERARBEID) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            const updatedValues: IPvoTilbakemelding = {
              ...response,
              status: submittedStatus,
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
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvoTilbakemeldingToFormValue(pvoTilbakemelding)}
      validationSchema={sendInnCheck}
    >
      {({ submitForm, dirty }) => (
        <Form>
          <div className='pt-6 flex justify-center'>
            <div>
              <div className='my-5 max-w-[75ch]'>
                <Label>Beskjed fra etterlever</Label>
                <DataTextWrapper customEmptyMessage='Ingen beskjed'>
                  {pvkDokument.merknadTilPvoEllerRisikoeier}
                </DataTextWrapper>
              </div>

              <Heading level='1' size='medium' className='mb-5'>
                Tilbakemelding til etterlever
              </Heading>

              {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                <div>
                  <Field name='arbeidGarVidere'>
                    {(fieldProps: FieldProps) => (
                      <RadioGroup
                        legend='Anbefales det at arbeidet går videre som planlagt?'
                        value={
                          fieldProps.field.value === null
                            ? null
                            : fieldProps.field.value === true
                              ? 'Ja'
                              : 'Nei'
                        }
                        onChange={(value) => {
                          const boolValue = value === null ? null : value === 'Ja' ? true : false
                          fieldProps.form.setFieldValue('arbeidGarVidere', boolValue)
                        }}
                        error={fieldProps.form.errors.arbeidGarVidere as string}
                      >
                        <Radio value='Ja'>Ja</Radio>
                        <Radio value='Nei'>Nei</Radio>
                      </RadioGroup>
                    )}
                  </Field>

                  <Field name='behovForForhandskonsultasjon'>
                    {(fieldProps: FieldProps) => (
                      <RadioGroup
                        legend='Er det behov for forhåndskonsultasjon med Datatilsynet?'
                        value={
                          fieldProps.field.value === null
                            ? null
                            : fieldProps.field.value === true
                              ? 'Ja'
                              : 'Nei'
                        }
                        onChange={(value) => {
                          const boolValue = value === null ? null : value === 'Ja' ? true : false
                          fieldProps.form.setFieldValue('behovForForhandskonsultasjon', boolValue)
                        }}
                        error={fieldProps.form.errors.behovForForhandskonsultasjon as string}
                      >
                        <Radio value='Ja'>Ja</Radio>
                        <Radio value='Nei'>Nei</Radio>
                      </RadioGroup>
                    )}
                  </Field>

                  <div className='mt-5 mb-3 max-w-[75ch]'>
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Er det noe annet dere ønsker å formidle til etterlever?'
                      name='merknadTilEtterleverEllerRisikoeier'
                    />
                  </div>
                </div>
              )}

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <div className='mt-5 mb-3 max-w-[75ch]'>
                  <div className='mb-3'>
                    <Label>Anbefales det at arbeidet går videre som planlagt?</Label>
                    <DataTextWrapper>
                      {pvoTilbakemelding.arbeidGarVidere === null
                        ? null
                        : pvoTilbakemelding.arbeidGarVidere === true
                          ? 'Ja'
                          : 'Nei'}
                    </DataTextWrapper>
                  </div>

                  <div className='mb-3'>
                    <Label>Er det behov for forhåndskonsultasjon med Datatilsynet?</Label>
                    <DataTextWrapper>
                      {pvoTilbakemelding.behovForForhandskonsultasjon === null
                        ? null
                        : pvoTilbakemelding.behovForForhandskonsultasjon === true
                          ? 'Ja'
                          : 'Nei'}
                    </DataTextWrapper>
                  </div>

                  <Label>Beskjed til etterlever</Label>
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

                    {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() => {
                          setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                          submitForm()
                        }}
                      >
                        Angre tilbakemelding
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

            <AlertPvoModal
              isOpen={isAlertModalOpen}
              onClose={() => setIsAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SendInnPvoView
