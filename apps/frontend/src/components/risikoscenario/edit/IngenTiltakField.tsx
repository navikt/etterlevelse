import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject } from 'react'
import {
  getRisikoscenario,
  mapRisikoscenarioToFormValue,
  updateRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
  formRef?: RefObject<any>
}

export const IngenTiltakField = (props: IProps) => {
  const { risikoscenario, setRisikoscenario, formRef } = props

  const submit = async (submitedValues: IRisikoscenario) => {
    await getRisikoscenario(risikoscenario.id).then((response) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        ingenTiltak: submitedValues.ingenTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response) => {
        setRisikoscenario(response)
        window.location.reload()
      })
    })
  }

  return (
    <div>
      <Formik
        initialValues={mapRisikoscenarioToFormValue(risikoscenario)}
        onSubmit={submit}
        innerRef={formRef}
      >
        {({ submitForm }) => (
          <Form>
            <Field name="ingenTiltak">
              {(fieldProps: FieldProps) => (
                <CheckboxGroup
                  legend=""
                  hideLegend
                  value={fieldProps.field.value ? ['ingenTiltak'] : []}
                  onChange={(value) => {
                    const fieldValue = value.length > 0 ? true : false
                    fieldProps.form.setFieldValue('ingenTiltak', fieldValue)
                  }}
                >
                  <Checkbox value={'ingenTiltak'}>Ingen tiltak</Checkbox>
                </CheckboxGroup>
              )}
            </Field>

            <Button type="button" onClick={() => submitForm()}>
              Lagre
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
export default IngenTiltakField
