import { FilesIcon } from '@navikt/aksel-icons'
import { Button, CopyButton, Heading, Label, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { FieldRadioLayout, IndentLayoutTextField } from '../common/IndentLayout'
import { TextAreaField } from '../common/Inputs'
import AlertPvoModal from './common/AlertPvoModal'
import DataTextWrapper from './common/DataTextWrapper'
import PvoFormButtons from './edit/PvoFormButtons'

type TProps = {
  pvkDokument: IPvkDokument
  activeStep: number
  dirty: boolean
  submitForm: () => Promise<void>
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvoTilbakemelding>>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
}

export const SendInnPvoViewIkkeFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  activeStep,
  dirty,
  submitForm,
  setFieldValue,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
}) => (
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

      <div>
        <FieldRadioLayout>
          <TextAreaField
            rows={3}
            noPlaceholder
            label='Er det noe annet dere ønsker å formidle til etterlever?'
            name='merknadTilEtterleverEllerRisikoeier'
          />
        </FieldRadioLayout>
        <FieldRadioLayout>
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
                onChange={async (value) => {
                  const boolValue = value === null ? null : value === 'Ja' ? true : false
                  await fieldProps.form.setFieldValue('arbeidGarVidere', boolValue)
                }}
                error={fieldProps.form.errors.arbeidGarVidere as string}
              >
                <Radio value='Ja'>Ja</Radio>
                <Radio value='Nei'>Nei</Radio>
              </RadioGroup>
            )}
          </Field>

          <Field>
            {(fieldProps: FieldProps) => (
              <>
                {fieldProps.form.values.arbeidGarVidere === true && (
                  <IndentLayoutTextField>
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Beskriv anbefalingen nærmere:'
                      name='placeholder2'
                    />
                  </IndentLayoutTextField>
                )}
              </>
            )}
          </Field>
        </FieldRadioLayout>

        <FieldRadioLayout>
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
                onChange={async (value) => {
                  const boolValue = value === null ? null : value === 'Ja' ? true : false
                  await fieldProps.form.setFieldValue('behovForForhandskonsultasjon', boolValue)
                }}
                error={fieldProps.form.errors.behovForForhandskonsultasjon as string}
              >
                <Radio value='Ja'>Ja</Radio>
                <Radio value='Nei'>Nei</Radio>
              </RadioGroup>
            )}
          </Field>
          <Field>
            {(fieldProps: FieldProps) => (
              <>
                {fieldProps.form.values.behovForForhandskonsultasjon === true && (
                  <IndentLayoutTextField>
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label='Beskriv anbefalingen nærmere:'
                      name='placeholder2'
                    />
                  </IndentLayoutTextField>
                )}
              </>
            )}
          </Field>
        </FieldRadioLayout>
      </div>

      <CopyButton
        variant='action'
        copyText={window.location.href}
        text='Kopiér lenken til denne siden'
        activeText='Lenken er kopiert'
        icon={<FilesIcon aria-hidden />}
      />

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
                onClick={async () => {
                  await setFieldValue('status', EPvoTilbakemeldingStatus.UNDERARBEID)
                  setSubmittedStatus(EPvoTilbakemeldingStatus.UNDERARBEID)
                  await submitForm()
                }}
              >
                Lagre og fortsett senere
              </Button>
            )}

            <Button
              type='button'
              onClick={async () => {
                await setFieldValue('status', EPvoTilbakemeldingStatus.FERDIG)
                setSubmittedStatus(EPvoTilbakemeldingStatus.FERDIG)
                await submitForm()
              }}
            >
              Send tilbakemelding
            </Button>
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
)

export default SendInnPvoViewIkkeFerdig
