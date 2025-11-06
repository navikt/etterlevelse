'use client'

import { arkiver } from '@/api/p360/p360Api'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import AlertPvoModal from '@/components/pvoTilbakemelding/common/alertPvoModal'
import { CopyLinkPvoButton } from '@/components/pvoTilbakemelding/common/copyLinkPvoButton'
import {
  FieldRadioLayout,
  IndentLayoutTextField,
} from '@/components/pvoTilbakemelding/form/pvoFieldLayout'
import PvoFormButtons from '@/components/pvoTilbakemelding/form/pvoFormButtons'
import PvoFormErrors from '@/components/pvoTilbakemelding/form/pvoFormErrors'
import { BeskjedFraEtterleverReadOnly } from '@/components/pvoTilbakemelding/readOnly/beskjedFraEtterleverReadOnly'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import {
  EPvoTilbakemeldingStatus,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { env } from '@/util/env/env'
import { Alert, Button, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import _ from 'lodash'
import {
  Dispatch,
  FunctionComponent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  activeStep: number
  submitForm: () => Promise<void>
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IVurdering>>
  setSubmittedStatus: (value: SetStateAction<EPvoTilbakemeldingStatus>) => void
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  isAlertModalOpen: boolean
  setIsAlertModalOpen: Dispatch<SetStateAction<boolean>>
  pvoVurderingList: ICode[]
  errors: FormikErrors<IVurdering>
  formRef: RefObject<any>
  sucessSubmit: boolean
  setSuccessSubmit: (state: boolean) => void
}

export const SendInnPvoViewIkkeFerdig: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  activeStep,
  submitForm,
  setFieldValue,
  setSubmittedStatus,
  setActiveStep,
  setSelectedStep,
  isAlertModalOpen,
  setIsAlertModalOpen,
  pvoVurderingList,
  errors,
  formRef,
  sucessSubmit,
  setSuccessSubmit,
}) => {
  const [submitClicked, setSubmitClicked] = useState<boolean>(false)
  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const updateCheckBoxOnRadioChange = async (value: string) => {
    if (value === 'BRA_PVK' || value === undefined) {
      await setFieldValue('pvoFolgeOppEndringer', false)
      await setFieldValue('vilFaPvkIRetur', false)
    } else if (value === 'OK_PVK') {
      await setFieldValue('pvoFolgeOppEndringer', true)
      await setFieldValue('vilFaPvkIRetur', false)
    } else {
      await setFieldValue('pvoFolgeOppEndringer', true)
      await setFieldValue('vilFaPvkIRetur', true)
    }
  }

  useEffect(() => {
    if (!_.isEmpty(formRef?.current?.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClicked])

  return (
    <div className='pt-6 w-full'>
      <div className='w-full flex justify-center'>
        <div className='max-w-[75ch]'>
          <BeskjedFraEtterleverReadOnly pvkDokument={pvkDokument} />

          <div>
            <FieldRadioLayout>
              <TextAreaField
                height='150px'
                noPlaceholder
                label='Er det noe annet dere ønsker å formidle til etterlever?'
                name='merknadTilEtterleverEllerRisikoeier'
                markdown
              />
            </FieldRadioLayout>
            <FieldRadioLayout>
              <Field name='arbeidGarVidere'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    id='arbeidGarVidere'
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
              <IndentLayoutTextField>
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label='Beskriv anbefalingen nærmere:'
                  name='arbeidGarVidereBegrunnelse'
                />
              </IndentLayoutTextField>
            </FieldRadioLayout>

            <FieldRadioLayout>
              <Field name='behovForForhandskonsultasjon'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    id='behovForForhandskonsultasjon'
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

              <IndentLayoutTextField>
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label='Beskriv anbefalingen nærmere:'
                  name='behovForForhandskonsultasjonBegrunnelse'
                />
              </IndentLayoutTextField>
            </FieldRadioLayout>

            <FieldRadioLayout>
              <Field name='pvoVurdering'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    id='pvoVurdering'
                    legend='PVOs vurdering'
                    value={fieldProps.form.values.pvoVurdering}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('pvoVurdering', value)
                      updateCheckBoxOnRadioChange(value)
                    }}
                    error={
                      fieldProps.form.errors.pvoVurdering ? 'Dere må oppgi en vurdering' : undefined
                    }
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

            <div className='mb-5'>
              <Button
                size='small'
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('arbeidGarVidere', null)
                  await setFieldValue('behovForForhandskonsultasjon', null)
                  await setFieldValue('pvoVurdering', null)
                  await setFieldValue('pvoFolgeOppEndringer', false)
                  await setFieldValue('vilFaPvkIRetur', false)
                }}
              >
                Nullstill valg
              </Button>
            </div>
          </div>

          <CopyLinkPvoButton />

          {sucessSubmit && (
            <Alert variant='success' closeButton onClose={() => setSuccessSubmit(false)}>
              Lagring velykket
            </Alert>
          )}

          <PvoFormErrors errors={errors} errorSummaryRef={errorSummaryRef} />
        </div>
      </div>

      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        customButtons={
          <div className='mt-5 flex gap-2 items-center'>
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

            <Button
              type='button'
              onClick={async () => {
                await setFieldValue('status', EPvoTilbakemeldingStatus.FERDIG)
                setSubmittedStatus(EPvoTilbakemeldingStatus.FERDIG)
                await submitForm().then(async () => {
                  if (!env.isDev) {
                    await arkiver(etterlevelseDokumentasjon.id, true, true, false)
                  }
                })
                setSubmitClicked(!submitClicked)
              }}
            >
              Lagre, send tilbakemelding, og arkivér i Public 360
            </Button>
          </div>
        }
      />

      <AlertPvoModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        pvkDokumentId={pvkDokument.id}
      />
    </div>
  )
}

export default SendInnPvoViewIkkeFerdig
