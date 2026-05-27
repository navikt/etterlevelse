import { mapTiltakToFormValue } from '@/api/tiltak/tiltakApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { PencilIcon } from '@navikt/aksel-icons'
import { Button, Checkbox, CheckboxGroup, Modal } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik'
import { FunctionComponent, RefObject, useState } from 'react'
import TiltakView from '../common/tiltakView'

type TProps = {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
  submit: (tiltak: ITiltak) => Promise<void>
  formRef: RefObject<any>
  setIverksattFormDirty: (state: boolean) => void
}

export const IverksattTiltakForm: FunctionComponent<TProps> = ({
  tiltak,
  risikoscenarioList,
  submit,
  formRef,
  setIverksattFormDirty,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  return (
    <div>
      <Formik
        initialValues={mapTiltakToFormValue(tiltak)}
        onSubmit={async (values: ITiltak, formikHelpers: FormikHelpers<ITiltak>) => {
          await submit(values).then(() => {
            formikHelpers.resetForm({ values })
          })
        }}
        innerRef={formRef}
      >
        {({ values, submitForm, initialValues }) => (
          <Form>
            <Button
              type='button'
              variant='tertiary'
              size='small'
              onClick={() => setIsModalOpen(true)}
              icon={<PencilIcon title='' aria-hidden />}
            >
              {!values.iverksatt ? 'Marker tiltaket som iverksatt' : 'Endre iverksatt tilstand'}
            </Button>
            <Modal
              open={isModalOpen}
              header={{
                heading: !values.iverksatt
                  ? 'Marker tiltaket som iverksatt'
                  : 'Endre iverksatt tilstand',
                closeButton: false,
              }}
              onClose={() => setIsModalOpen(false)}
            >
              <Modal.Body>
                <TiltakView
                  tiltak={values}
                  risikoscenarioList={risikoscenarioList}
                  noIverksattKommentar={true}
                />

                <Field name='iverksatt'>
                  {(fieldProps: FieldProps) => (
                    <CheckboxGroup
                      legend=''
                      hideLegend
                      value={fieldProps.field.value ? ['iverksatt'] : []}
                      onChange={async (value) => {
                        const fieldValue: boolean = value.length > 0 ? true : false
                        await fieldProps.form.setFieldValue('iverksatt', fieldValue)
                        if (fieldValue !== initialValues.iverksatt) {
                          setIverksattFormDirty(true)
                        } else {
                          setIverksattFormDirty(false)
                        }
                      }}
                    >
                      <Checkbox value='iverksatt'>Marker tiltaket som iverksatt</Checkbox>
                    </CheckboxGroup>
                  )}
                </Field>

                {values.iverksatt && (
                  <TextAreaField
                    label='Beskriv nærmere hvordan tiltaket er iverksatt (valgfritt)'
                    name='iverksettingsKommentar'
                    rows={3}
                    noPlaceholder
                    marginBottom
                  />
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type='button'
                  onClick={async () => {
                    await submitForm()
                  }}
                >
                  Lagre
                </Button>

                <Button
                  type='button'
                  variant='secondary'
                  onClick={async () => {
                    setIsModalOpen(false)
                  }}
                >
                  Avbryt
                </Button>
              </Modal.Footer>
            </Modal>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default IverksattTiltakForm
