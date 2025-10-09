import { FormError } from '@/components/common/modalSchema/formError/formError'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import RisikoscenarioSannsynlighetReadMore from '@/components/risikoscenario/common/risikoscenarioSannsynlighetReadMore'
import { Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'

export const RisikoscenarioSannsynlighetField = () => (
  <>
    <Heading level='3' size='small' className='my-5'>
      Risikoscenariets sannsynlighet
    </Heading>

    <RisikoscenarioSannsynlighetReadMore />

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

    <div className='mt-3'>
      <TextAreaField
        rows={3}
        noPlaceholder
        label='Begrunn sannsynlighetsnivået'
        name='sannsynlighetsNivaaBegrunnelse'
      />
    </div>
  </>
)

export default RisikoscenarioSannsynlighetField
