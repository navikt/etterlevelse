import { EnvelopeClosedIcon } from '@navikt/aksel-icons'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  CopyButton,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createPvkDokument,
  getPvkDokumentByEtterlevelseDokumentId,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '../../../api/PvkDokumentApi'
import { IEtterlevelseDokumentasjon, IPvkDokument } from '../../../constants'
import { CodelistService, EListName, ICode } from '../../../services/Codelist'
import { FieldWrapper, TextAreaField } from '../../common/Inputs'
import pvkBehovSchema from './pvkBehovSchema'

type TProps = {
  pvkDokument: IPvkDokument
  setPvkDokument: (state: IPvkDokument) => void
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  profilering: boolean | null
  automatiskBehandling: boolean | null
  saerligKategorier: boolean
  checkedYtterligereEgenskaper: string[]
  setCheckedYtterligereEgenskaper: (state: string[]) => void
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
}) => {
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false)
  const [urlToNavigate, setUrlToNavigate] = useState<string>('')
  const formRef: RefObject<any> = useRef(undefined)
  const [codelistUtils] = CodelistService()
  const navigate = useNavigate()

  const ytterligereEgenskaper: ICode[] = codelistUtils.getCodes(
    EListName.YTTERLIGERE_EGENSKAPER
  ) as ICode[]

  const submit = async (pvkDokument: IPvkDokument) => {
    if (etterlevelseDokumentasjon) {
      const mutatedPvkDokument = {
        ...pvkDokument,
        etterlevelseDokumentId: etterlevelseDokumentasjon.id,
      } as IPvkDokument

      //double check if etterlevelse already exist before submitting
      let existingPvkDokumentId = ''
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
        await updatePvkDokument(mutatedPvkDokument)
          .then((response) => {
            setPvkDokument(response)
          })
          .finally(() => window.location.reload())
      } else {
        await createPvkDokument(mutatedPvkDokument)
          .then((response) => {
            setPvkDokument(response)
          })
          .finally(() => window.location.reload())
      }
    }
  }

  return (
    <>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={pvkBehovSchema}
        onSubmit={submit}
        initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
        innerRef={formRef}
      >
        {({ setFieldValue, values, submitForm, dirty }) => (
          <Form>
            <div id="ytterlige-egenskaper">
              <FieldArray name="ytterligereEgenskaper">
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <CheckboxGroup
                    legend="Les igjennom og velg eventuelt øvrige egenskaper som gjelder for behandlingene deres:"
                    value={checkedYtterligereEgenskaper}
                    onChange={(selected: string[]) => {
                      setCheckedYtterligereEgenskaper(selected)

                      fieldArrayRenderProps.form.setFieldValue(
                        'ytterligereEgenskaper',
                        selected.map((egenskapId: string) =>
                          codelistUtils.getCode(EListName.YTTERLIGERE_EGENSKAPER, egenskapId)
                        )
                      )
                    }}
                  >
                    {ytterligereEgenskaper.map((egenskap) => (
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
              <Alert className="mb-5 mt-10" variant="info">
                Data som hentes og svarene dere har oppgitt gir en indikasjon på at det kan være
                behov for gjennomføring av PVK. Likevel er dere ansvarlige for å vurdere behov.
              </Alert>
            )}

            <ReadMore
              className="mt-10 mb-4"
              header="Lurer dere fortsatt på om det er behov for PVK?"
            >
              Personvernombudet (PVO) kan hjelpe dere å vurdere om dere skal gjøre en PVK. Ta
              kontakt via mail.
              <CopyButton
                className="mt-3 border-2 border-solid"
                variant="action"
                copyText="pvk@nav.no"
                text="Kopiér PVO sin e-postadresse"
                activeText="E-postadressen er kopiert"
                icon={<EnvelopeClosedIcon aria-hidden />}
              />
            </ReadMore>

            <FieldWrapper marginBottom marginTop>
              <Field name="skalUtforePvk">
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    legend="Hvilken vurdering har dere kommet fram til?"
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
                label="Begrunn vurderingen deres"
                name="pvkVurderingsBegrunnelse"
              />
            )}

            <div className="flex items-center mt-5 gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  submitForm()
                }}
              >
                Lagre
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  window.location.reload()
                }}
              >
                Forkast endringer
              </Button>

              <Button
                type="button"
                variant="tertiary"
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
            <div className="mt-5 flex w-full gap-2 items-end">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => {
                  if (dirty) {
                    setIsUnsavedModalOpen(true)
                    setUrlToNavigate('/dokumentasjon/' + etterlevelseDokumentasjon.id)
                  } else {
                    navigate('/dokumentasjon/' + etterlevelseDokumentasjon.id)
                  }
                }}
              >
                Gå til Temaoversikt
              </Button>
              {pvkDokument && pvkDokument.id && values.skalUtforePvk && (
                <Button
                  iconPosition="right"
                  type="button"
                  variant={'tertiary'}
                  onClick={() => {
                    if (dirty) {
                      setIsUnsavedModalOpen(true)
                      setUrlToNavigate(
                        '/dokumentasjon/' +
                          etterlevelseDokumentasjon.id +
                          '/pvkdokument/' +
                          pvkDokument.id +
                          '/1'
                      )
                    } else {
                      navigate(
                        '/dokumentasjon/' +
                          etterlevelseDokumentasjon.id +
                          '/pvkdokument/' +
                          pvkDokument.id +
                          '/1'
                      )
                    }
                  }}
                >
                  Gå til PVK
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
      {isUnsavedModalOpen && (
        <Modal
          onClose={() => setIsUnsavedModalOpen(false)}
          open={isUnsavedModalOpen}
          header={{
            heading: 'Vil du lagre endringene dine før du går videre?',
            closeButton: false,
          }}
        >
          <Modal.Body>
            <br />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              onClick={() => {
                formRef.current?.submitForm()
                navigate(urlToNavigate)
                setIsUnsavedModalOpen(false)
              }}
            >
              Lagre og fortsette
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigate(urlToNavigate)
                setIsUnsavedModalOpen(false)
              }}
            >
              Fortsett uten å lagre
            </Button>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => {
                setIsUnsavedModalOpen(false)
              }}
            >
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export default PvkBehovForm
