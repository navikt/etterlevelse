import { Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { FormError } from '../../../common/ModalSchema'

export const RisikoscenarioSannsynligNivaaRadioField = () => (
  <Field name='sannsynlighetsNivaa'>
    {(fieldProps: FieldProps) => (
      <RadioGroup
        legend='Vurdér risikoscenarioets sannsynlighetsnivå'
        value={fieldProps.field.value}
        onChange={(value: any) => {
          fieldProps.form.setFieldValue('sannsynlighetsNivaa', value)
        }}
        error={
          fieldProps.form.errors['sannsynlighetsNivaa'] && (
            <FormError fieldName='sannsynlighetsNivaa' />
          )
        }
      >
        <Radio value={1}>1 - Meget lite sannsynlig</Radio>
        <Radio value={2}>2 - Lite sannsynlig</Radio>
        <Radio value={3}>3 - Moderat sannsynlig</Radio>
        <Radio value={4}>4 - Sannsynlig</Radio>
        <Radio value={5}>5 - Nesten sikkert</Radio>
      </RadioGroup>
    )}
  </Field>
)

export default RisikoscenarioSannsynligNivaaRadioField
