'use client'

import {
  createPvkDokument,
  getPvkDokumentByEtterlevelseDokumentId,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '@/api/pvkDokument/pvkDokumentApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import UnsavedModalAlert from '@/components/common/unsavedModalAlert/unsavedModalAlert'
import { StickyFooterButtonLayout } from '@/components/others/layout/content/content'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import {
  pvkDokumentasjonPvkBehovUrl,
  pvkDokumentasjonStepUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { ChevronLeftIcon, ChevronRightIcon, EnvelopeClosedIcon } from '@navikt/aksel-icons'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
} from 'formik'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject, useContext, useRef, useState } from 'react'
import { pvkBehovSchema } from './pvkBehovSchema'

type TProps = {
  pvkDokument: IPvkDokument
  setPvkDokument: (state: IPvkDokument) => void
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  profilering: boolean | null
  automatiskBehandling: boolean | null
  saerligKategorier: boolean
  checkedYtterligereEgenskaper: string[]
  setCheckedYtterligereEgenskaper: (state: string[]) => void
  ytterligereEgenskaper: ICode[]
}

export const PvkBehovForm: FunctionComponent<TProps> = ({
  pvkDokument,
  setPvkDokument,
  etterlevelseDokumentasjon,
  profilering,
  automatiskBehandling,
  saerligKategorier,
  checkedYtterligereEgenskaper,
  setCheckedYtterligereEgenskaper,
  ytterligereEgenskaper,
}) => {
  const router = useRouter()
  const formRef: RefObject<any> = useRef(undefined)

  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)
  const [urlToNavigate, setUrlToNavigate] = useState<string>('')
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [savedAlert, setSavedAlert] = useState<boolean>(false)

  const codelist = useContext(CodelistContext)

  const submit = async (pvkDokument: IPvkDokument): Promise<void> => {
    if (etterlevelseDokumentasjon) {
      const mutatedPvkDokument: IPvkDokument = {
        ...pvkDokument,
        etterlevelseDokumentId: etterlevelseDokumentasjon.id,
      } as IPvkDokument

      //double check if etterlevelse already exist before submitting
      let existingPvkDokumentId: string = ''
      if (etterlevelseDokumentasjon) {
        const pvkDokument = await getPvkDokumentByEtterlevelseDokumentId(
          etterlevelseDokumentasjon.id
        ).catch(() => undefined)
        if (pvkDokument) {
          existingPvkDokumentId = pvkDokument.id
          mutatedPvkDokument.id = pvkDokument.id
        }
      }

      if (pvkDokument.id || existingPvkDokumentId) {
        if (isReadOnlyPvkStatus(pvkDokument.status)) {
          setIsPvoAlertModalOpen(true)
        } else {
          await updatePvkDokument(mutatedPvkDokument)
            .then((response: IPvkDokument) => {
              setPvkDokument(response)
            })
            .finally(() => setSavedAlert(true))
        }
      } else {
        await createPvkDokument(mutatedPvkDokument)
          .then((response: IPvkDokument) => {
            setPvkDokument(response)
            window.history.pushState(
              { savedAlert: true, pvkDokument: response },
              '',
              pvkDokumentasjonPvkBehovUrl(response.etterlevelseDokumentId, response.id)
            )
          })
          .finally(() => setSavedAlert(true))
      }
    }
  }

  return (
    <>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={pvkBehovSchema}
        onSubmit={async (values: IPvkDokument, formikHelpers: FormikHelpers<IPvkDokument>) => {
          await submit(values).then(() => {
            formikHelpers.resetForm({ values })
          })
        }}
        initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
        innerRef={formRef}
      >
        {({ initialValues, setFieldValue, values, submitForm, dirty, resetForm }) => (
          <Form>
            <div id='ytterligere-egenskaper'>
              <FieldArray name='ytterligereEgenskaper'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <CheckboxGroup
                    legend='Les igjennom og velg eventuelt øvrige egenskaper som gjelder for behandlingene deres:'
                    value={checkedYtterligereEgenskaper}
                    onChange={(selected: string[]) => {
                      setCheckedYtterligereEgenskaper(selected)

                      fieldArrayRenderProps.form.setFieldValue(
                        'ytterligereEgenskaper',
                        selected.map((egenskapId: string) =>
                          codelist.utils.getCode(EListName.YTTERLIGERE_EGENSKAPER, egenskapId)
                        )
                      )
                    }}
                  >
                    {ytterligereEgenskaper.map((egenskap: ICode) => (
                      <Checkbox key={egenskap.code} value={egenskap.code}>
                        {egenskap.shortName}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                )}
              </FieldArray>
            </div>

            {(checkedYtterligereEgenskaper.length > 0 ||
              profilering ||
              automatiskBehandling ||
              saerligKategorier) && (
              <Alert className='mb-5 mt-10' variant='info'>
                Data som hentes og svarene dere har oppgitt gir en indikasjon på at det kan være
                behov for gjennomføring av PVK. Likevel er dere ansvarlige for å vurdere behov.
              </Alert>
            )}

            <ReadMore
              className='mt-10 mb-4'
              header='Lurer dere fortsatt på om det er behov for PVK?'
            >
              Personvernombudet (PVO) kan hjelpe dere å vurdere om dere skal gjøre en PVK. Ta
              kontakt via mail.
              <CopyButton
                className='mt-3 border-2 border-solid'
                variant='action'
                copyText='pvk@nav.no'
                text='Kopier PVO sin e-postadresse'
                activeText='E-postadressen er kopiert'
                icon={<EnvelopeClosedIcon aria-hidden />}
              />
            </ReadMore>

            <FieldWrapper marginBottom marginTop>
              <Field name='skalUtforePvk'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    legend='Hvilken vurdering har dere kommet fram til?'
                    value={fieldProps.field.value}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('skalUtforePvk', value)
                    }}
                  >
                    <Radio value={true}>Vi skal gjennomføre en PVK</Radio>
                    <Radio value={false}>Vi skal ikke gjennomføre PVK</Radio>
                  </RadioGroup>
                )}
              </Field>
            </FieldWrapper>

            {values.skalUtforePvk !== undefined && !values.skalUtforePvk && (
              <TextAreaField
                rows={5}
                noPlaceholder
                label='Begrunn vurderingen deres'
                name='pvkVurderingsBegrunnelse'
              />
            )}

            {savedAlert && !dirty && (
              <Alert
                className='mt-5'
                variant='success'
                closeButton
                onClose={() => setSavedAlert(false)}
              >
                Lagring vellykket
              </Alert>
            )}

            <div className='flex items-center mt-5 gap-2'>
              <Button
                type='button'
                variant='primary'
                onClick={async () => {
                  await submitForm()
                }}
              >
                Lagre
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  resetForm()
                  setCheckedYtterligereEgenskaper(
                    initialValues.ytterligereEgenskaper.map((egenskap) => egenskap.code)
                  )
                }}
              >
                Forkast endringer
              </Button>

              <Button
                type='button'
                variant='tertiary'
                onClick={() => {
                  setFieldValue('skalUtforePvk', null)
                  setFieldValue('pvkVurderingsBegrunnelse', '')
                  setFieldValue('ytterligereEgenskaper', [])
                  setCheckedYtterligereEgenskaper([])
                }}
              >
                Nullstill alle svar
              </Button>
            </div>

            <StickyFooterButtonLayout>
              <Button
                icon={<ChevronLeftIcon aria-hidden />}
                iconPosition='left'
                type='button'
                variant='tertiary'
                onClick={() => {
                  if (dirty) {
                    setIsUnsavedModalOpen(true)
                    setUrlToNavigate(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id))
                  } else {
                    router.push(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id))
                  }
                }}
              >
                Gå til Temaoversikt
              </Button>
              {pvkDokument && pvkDokument.id && values.skalUtforePvk && (
                <Button
                  icon={<ChevronRightIcon aria-hidden />}
                  iconPosition='right'
                  type='button'
                  variant={'tertiary'}
                  onClick={() => {
                    if (dirty) {
                      setIsUnsavedModalOpen(true)
                      setUrlToNavigate(
                        pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)
                      )
                    } else {
                      router.push(
                        pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 1)
                      )
                    }
                  }}
                >
                  Gå til PVK
                </Button>
              )}
            </StickyFooterButtonLayout>
          </Form>
        )}
      </Formik>

      <AlertPvoUnderArbeidModal
        isOpen={isPvoAlertModalOpen}
        onClose={() => setIsPvoAlertModalOpen(false)}
        pvkDokumentId={pvkDokument.id}
      />

      <UnsavedModalAlert
        isOpen={isUnsavedModalOpen}
        setIsOpen={setIsUnsavedModalOpen}
        urlToNavigate={urlToNavigate}
        formRef={formRef}
      />
    </>
  )
}

export default PvkBehovForm
