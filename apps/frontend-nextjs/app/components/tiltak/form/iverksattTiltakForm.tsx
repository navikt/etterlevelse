import { mapTiltakToFormValue } from '@/api/tiltak/tiltakApi'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik'
import { FunctionComponent, RefObject } from 'react'

type TProps = {
  tiltak: ITiltak
  submit: (tiltak: ITiltak) => Promise<void>
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
    <Formik
      initialValues={mapTiltakToFormValue(tiltak)}
      onSubmit={async (values: ITiltak, formikHelpers: FormikHelpers<ITiltak>) => {
        await submit(values).then(() => {
          formikHelpers.resetForm({ values })
        })
      }}
      innerRef={formRef}
    >
      {({ submitForm, dirty, initialValues }) => (
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
                await submitForm()
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
