import { Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { TextAreaField } from '../../../common/Inputs'
import { FormError } from '../../../common/ModalSchema'
import { RisikoscenarioSannsynlighetHeader } from '../../common/KravRisikoscenarioHeaders'
import RisikoscenarioModalFormReadMore from './RisikoscenarioModalFormSannsynlighetReadMore'

export const RisikoscenarioModalFormSannsynlighet = () => (
  <>
    <RisikoscenarioSannsynlighetHeader />

    <RisikoscenarioModalFormReadMore />

    <Field name="sannsynlighetsNivaa">
      {(fieldProps: FieldProps) => (
        <RadioGroup
          legend="Vurdér risikoscenariets sannsynlighetsnivå"
          value={fieldProps.field.value}
          onChange={(value: any) => {
            fieldProps.form.setFieldValue('sannsynlighetsNivaa', value)
          }}
          error={
            fieldProps.form.errors['sannsynlighetsNivaa'] && (
              <FormError fieldName="sannsynlighetsNivaa" />
            )
          }
        >
          <Radio value={1}>Meget lite sannsynlig</Radio>
          <Radio value={2}>Lite sannsynlig</Radio>
          <Radio value={3}>Moderat sannsynlig</Radio>
          <Radio value={4}>Sannsynlig</Radio>
          <Radio value={5}>Nesten sikkert</Radio>
        </RadioGroup>
      )}
    </Field>

    <div className="mt-3">
      <TextAreaField
        rows={3}
        noPlaceholder
        label="Begrunn sannsynlighetsnivået"
        name="sannsynlighetsNivaaBegrunnelse"
      />
    </div>
  </>
)

export default RisikoscenarioModalFormSannsynlighet
