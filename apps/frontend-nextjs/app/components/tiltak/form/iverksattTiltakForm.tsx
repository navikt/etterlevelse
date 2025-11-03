import { mapTiltakToFormValue } from '@/api/tiltak/tiltakApi'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  tiltak: ITiltak
  submit: (tiltak: ITiltak) => void
  formRef: RefObject<any>
  setIverksattFormDirty: (state: boolean) => void
}

export const IverksattTiltakForm: FunctionComponent<TProps> = ({
  tiltak,
  submit,
  formRef,
  setIverksattFormDirty,
}) => (
  <div>
    <Formik initialValues={mapTiltakToFormValue(tiltak)} onSubmit={submit} innerRef={formRef}>
      {({ submitForm, values, resetForm, dirty, initialValues }) => (
        <Form>
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
                <Checkbox value='iverksatt'>Markér tiltaket som iverksatt</Checkbox>
              </CheckboxGroup>
            )}
          </Field>

          {dirty && (
            <Button
              type='button'
              onClick={async () => {
                await submitForm().then(() => {
                  resetForm({ values: values })
                })
              }}
            >
              Lagre
            </Button>
          )}
        </Form>
      )}
    </Formik>
  </div>
)

export default IverksattTiltakForm
