import { Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { FormError } from '../../../common/ModalSchema'

export const RisikoscenarioKonsekvensnivaaNivaaRadioField = () => (
  <Field name='konsekvensNivaa'>
    {(fieldProps: FieldProps) => (
      <RadioGroup
        legend='Vurdér risikoscenarioets konsekvensnivå'
        value={fieldProps.field.value}
        onChange={(value: any) => {
          fieldProps.form.setFieldValue('konsekvensNivaa', value)
        }}
        error={
          fieldProps.form.errors['konsekvensNivaa'] && <FormError fieldName='konsekvensNivaa' />
        }
      >
        <Radio value={1}>1 - Ubetydelig</Radio>
        <Radio value={2}>2 - Lav konsekvens</Radio>
        <Radio value={3}>3 - Moderat konsekvens</Radio>
        <Radio value={4}>4 - Alvorlig konsekvens</Radio>
        <Radio value={5}>5 - Svært alvorlig konsekvens</Radio>
      </RadioGroup>
    )}
  </Field>
)
