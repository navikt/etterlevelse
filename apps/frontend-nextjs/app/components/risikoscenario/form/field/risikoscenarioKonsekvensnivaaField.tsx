import { FormError } from '@/components/common/modalSchema/formError/formError'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import RisikoscenarioKonsekvensnivaaReadMore from '../../common/risikoscenarioKonsekvensnivaaReadMore'

export const RisikoscenarioKonsekvensnivaaField = () => (
  <>
    <Heading level='3' size='small' className='my-5'>
      Risikoscenariets konsekvensnivå
    </Heading>

    <RisikoscenarioKonsekvensnivaaReadMore />

    <Field name='konsekvensNivaa'>
      {(fieldProps: FieldProps) => (
        <RadioGroup
          legend='Vurder risikoscenarioets konsekvensnivå'
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

    <div className='mt-3'>
      <TextAreaField
        rows={3}
        noPlaceholder
        label='Begrunn konsekvensnivået'
        name='konsekvensNivaaBegrunnelse'
      />
    </div>
  </>
)

export default RisikoscenarioKonsekvensnivaaField
