import { Button, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { arkiver } from '../../api/P360Api'
import {
  EPvoTilbakemeldingStatus,
  IEtterlevelseDokumentasjon,
  IPvkDokument,
  IPvoTilbakemelding,
} from '../../constants'
import { ICode } from '../../services/Codelist'
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
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
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
  pvoVurderingList: ICode[]
}

export const SendInnPvoViewIkkeFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  activeStep,
  dirty,
  submitForm,
  setFieldValue,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
  pvoVurderingList,
}) => {
  const updateCheckBoxOnRadioChange = async (value: string) => {
    if (value === 'BRA_PVK' || value === undefined) {
      await setFieldValue('pvoFolgeOppEndringer', false)
      await setFieldValue('vilFaPvkIRetur', false)
    } else if (value === 'OK_PVK') {
      await setFieldValue('pvoFolgeOppEndringer', true)
    } else {
      await setFieldValue('pvoFolgeOppEndringer', true)
      await setFieldValue('vilFaPvkIRetur', true)
    }
  }

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
                        name='arbeidGarVidereBegrunnelse'
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
                        name='behovForForhandskonsultasjonBegrunnelse'
                      />
                    </IndentLayoutTextField>
                  )}
                </>
              )}
            </Field>
          </FieldRadioLayout>

          <FieldRadioLayout>
            <Field name='pvoVurdering'>
              {(fieldProps: FieldProps) => (
                <RadioGroup
                  legend='PVOs vurdering'
                  value={fieldProps.form.values.pvoVurdering}
                  onChange={(value) => {
                    fieldProps.form.setFieldValue('pvoVurdering', value)
                    updateCheckBoxOnRadioChange(value)
                  }}
                >
                  {pvoVurderingList.map((vurdering, index) => (
                    <Radio key={vurdering.code + '_' + index} value={vurdering.code}>
                      {vurdering.description}
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            </Field>
          </FieldRadioLayout>

          <Field>
            {(fieldProps: FieldProps) => (
              <CheckboxGroup
                className='my-5'
                legend='PVOs vudering'
                hideLegend
                value={(() => {
                  const valueList: string[] = []
                  if (fieldProps.form.values.pvoFolgeOppEndringer) {
                    valueList.push('pvoFolgeOppEndringer')
                  }
                  if (fieldProps.form.values.vilFaPvkIRetur) {
                    valueList.push('vilFaPvkIRetur')
                  }
                  return valueList
                })()}
                onChange={async (value: string[]) => {
                  if (value.includes('pvoFolgeOppEndringer')) {
                    await setFieldValue('pvoFolgeOppEndringer', true)
                  }
                  if (value.includes('vilFaPvkIRetur')) {
                    await setFieldValue('vilFaPvkIRetur', true)
                  }
                  if (!value.includes('pvoFolgeOppEndringer')) {
                    await setFieldValue('pvoFolgeOppEndringer', false)
                  }
                  if (!value.includes('vilFaPvkIRetur')) {
                    await setFieldValue('vilFaPvkIRetur', false)
                  }
                }}
              >
                <Checkbox value='pvoFolgeOppEndringer'>
                  PVO vil følge opp endringer dere gjør.
                </Checkbox>
                <Checkbox value='vilFaPvkIRetur'>
                  PVO vil få PVK i retur etter at dere har gjennomgått tilbakemeldinger.
                </Checkbox>
              </CheckboxGroup>
            )}
          </Field>
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
                  await arkiver(etterlevelseDokumentasjon.id, true, true, false)
                }}
              >
                Lagre, send tilbakemelding, og arkivér i Public 360
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
