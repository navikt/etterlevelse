import { Button, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import { FieldRadioLayout, IndentLayoutTextField } from '../common/IndentLayout'
import { TextAreaField } from '../common/Inputs'
import AlertPvoModal from './common/AlertPvoModal'
import {
  BeskjedTilbakemeldingEtterlever,
  CopyButtonCommon,
  LagreFortsettSenereButton,
} from './common/SendInnPvoView'
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
}) => {
  const [radioValue, setRadioValue] = useState<number>()
  const [checkboxValue, setCheckboxValue] = useState<string[]>([''])

  useEffect(() => {
    if (radioValue && radioValue < 2) {
      setCheckboxValue([''])
    }
    if (radioValue && radioValue > 1) {
      setCheckboxValue(['1'])
    }
    if (radioValue && radioValue > 2) {
      setCheckboxValue(['1', '2'])
    }
  }, [radioValue])

  return (
    <div className='pt-6 flex justify-center'>
      <div>
        <BeskjedTilbakemeldingEtterlever pvkDokument={pvkDokument} />

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

          <FieldRadioLayout>
            <Field name='pvosVurdering'>
              {(fieldProps: FieldProps) => (
                <>
                  <RadioGroup
                    legend='PVOs vurdering'
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('pvosVurdering', value)
                      setRadioValue(value)
                    }}
                  >
                    <Radio value='1'>
                      En bra PVK. Nå må dere lese, ta stilling til tilbakemeldinger og gjøre
                      eventuelle endringer endringer. Så må dere få PVK-en godkjent hos
                      risikoeieren.
                    </Radio>
                    <Radio value='2'>
                      Stort sett en bra PVK. Nå må dere lese, ta stilling til tilbakemeldinger og
                      gjøre eventuelle endringer. Så må dere få PVK-en godkjent hos risikoeieren.
                    </Radio>
                    <Radio value='3'>
                      PVO er uenig i risikobildet dere presenterer. Nå må dere lese, ta stilling til
                      tilbakemeldinger og gjøre eventuelle endringer. Det er viktig at dere kobler
                      på risikoeieren direkte.
                    </Radio>
                    <Radio value='4'>
                      PVO er uenig i risikobildet dere presenterer. Nå må dere lese, ta stilling til
                      tilbakemeldinger og gjøre eventuelle endringer. Det er viktig at dere kobler
                      på risikoeieren direkte. PVO kommer til å eskalere denne saken på grunn av
                      sine bekymringer.
                    </Radio>
                    <Radio value='5'>
                      PVO mener at PVK-en ikke er av god nok kvalitet til å vurdere. Nå må dere
                      lese, ta stilling til tilbakemeldinger og gjøre eventuelle endringer.
                    </Radio>
                  </RadioGroup>
                  <CheckboxGroup
                    legend='PVOs vudering'
                    hideLegend
                    value={checkboxValue}
                    onChange={(value: string[]) => setCheckboxValue(value)}
                  >
                    <Checkbox value='1'>PVO vil følge opp endringer dere gjør.</Checkbox>
                    <Checkbox value='2'>
                      PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.
                    </Checkbox>
                  </CheckboxGroup>
                </>
              )}
            </Field>
          </FieldRadioLayout>
        </div>

        <CopyButtonCommon />

        <PvoFormButtons
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
          submitForm={submitForm}
          customButtons={
            <div className='mt-5 flex gap-2 items-center'>
              {!dirty && <div className='min-w-[223px]'></div>}
              {dirty && (
                <LagreFortsettSenereButton
                  setFieldValue={setFieldValue}
                  setSubmittedStatus={setSubmittedStatus}
                  submitForm={submitForm}
                />
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
}

export default SendInnPvoViewIkkeFerdig
