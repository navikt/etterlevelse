import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  submit: (risikoscenario: IRisikoscenario) => void
  formRef: RefObject<any>
  setIsIngenTilgangFormDirty: (state: boolean) => void
}

export const IngenTiltakField = ({
  risikoscenario,
  submit,
  formRef,
  setIsIngenTilgangFormDirty,
}: IProps) => (
  <div>
    <Formik
      initialValues={mapRisikoscenarioToFormValue(risikoscenario)}
      onSubmit={submit}
      innerRef={formRef}
    >
      {({ submitForm, values, resetForm, dirty, initialValues }) => (
        <Form>
          <Field name="ingenTiltak">
            {(fieldProps: FieldProps) => (
              <CheckboxGroup
                legend=""
                hideLegend
                value={fieldProps.field.value ? ['ingenTiltak'] : []}
                onChange={(value) => {
                  const fieldValue: boolean = value.length > 0 ? true : false
                  fieldProps.form.setFieldValue('ingenTiltak', fieldValue)
                  if (fieldValue !== initialValues.ingenTiltak) {
                    setIsIngenTilgangFormDirty(true)
                  } else {
                    setIsIngenTilgangFormDirty(false)
                  }
                }}
              >
                <Checkbox value="ingenTiltak">Vi skal ikke ha tiltak</Checkbox>
              </CheckboxGroup>
            )}
          </Field>

          {dirty && (
            <Button
              type="button"
              onClick={() => {
                submitForm()
                resetForm({ values })
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

export default IngenTiltakField
