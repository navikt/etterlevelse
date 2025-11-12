import { useSearchKrav } from '@/api/krav/kravApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { IKravReference } from '@/constants/krav/kravConstants'
import { kravNummerView } from '@/util/krav/kravUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Checkbox, CheckboxGroup, Label } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import { FunctionComponent } from 'react'
import AsyncSelect from 'react-select/async'

type TProps = {
  generelScenarioFormValue: boolean
}

export const OvrigToKravSpesifikkRisikoscenarioField: FunctionComponent<TProps> = ({
  generelScenarioFormValue,
}) => (
  <div className='my-5'>
    <Field name='generelScenario'>
      {(fieldProps: FieldProps) => (
        <CheckboxGroup
          legend='Koble dette risikoscenarioet til PVK-relatert(e) etterlevelseskrav'
          hideLegend
          onChange={async (value: string[]) => {
            if (value.length !== 0) {
              await fieldProps.form.setFieldValue('generelScenario', false)
            } else {
              await fieldProps.form.setFieldValue('generelScenario', true)
            }
          }}
        >
          <Checkbox value='krav_spesifikk'>
            Koble dette risikoscenarioet til PVK-relatert(e) etterlevelseskrav
          </Checkbox>
        </CheckboxGroup>
      )}
    </Field>

    {!generelScenarioFormValue && (
      <div className='mt-5'>
        <FieldArray name='relevanteKravNummer'>
          {(fieldArrayRenderProps: FieldArrayRenderProps) => (
            <div className='my-3'>
              <Label>
                Velg 1 eller flere etterlevelseskrav hvor dette risikoscenarioet inntreffer
              </Label>
              <div className='w-full'>
                <AsyncSelect
                  aria-label='Søk etter behandlinger'
                  placeholder=''
                  components={{ DropdownIndicator }}
                  noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                  controlShouldRenderValue={false}
                  loadingMessage={() => 'Søker...'}
                  isClearable={false}
                  loadOptions={useSearchKrav}
                  onChange={(value: any) => {
                    if (value) {
                      fieldArrayRenderProps.push(value)
                    }
                  }}
                  styles={selectOverrides}
                />
              </div>
              <RenderTagList
                list={fieldArrayRenderProps.form.values.relevanteKravNummer.map(
                  (kravReference: IKravReference) =>
                    `${kravNummerView(kravReference.kravVersjon, kravReference.kravNummer)} ${kravReference.navn}`
                )}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )}
        </FieldArray>
      </div>
    )}
  </div>
)
