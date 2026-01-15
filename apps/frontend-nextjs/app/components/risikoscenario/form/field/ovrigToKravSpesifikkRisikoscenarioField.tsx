import { useSearchKravToOptionsPvk } from '@/api/krav/kravApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { IKravReference } from '@/constants/krav/kravConstants'
import { kravNummerView } from '@/util/krav/kravUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Alert, BodyLong, Checkbox, CheckboxGroup, Label, List } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import { FunctionComponent } from 'react'
import AsyncSelect from 'react-select/async'

type TProps = {
  generelScenarioFormValue: boolean
  relevanteKravNummerFormValue: IKravReference[]
  isOvrigScenario: boolean
}

export const OvrigToKravSpesifikkRisikoscenarioField: FunctionComponent<TProps> = ({
  generelScenarioFormValue,
  relevanteKravNummerFormValue,
  isOvrigScenario,
}) => (
  <div className='my-5'>
    <Field name='generelScenario'>
      {(fieldProps: FieldProps) => (
        <CheckboxGroup
          legend='Koble dette risikoscenarioet til PVK-relatert(e) etterlevelseskrav'
          hideLegend
          value={fieldProps.form.values.generelScenario ? [] : ['krav_spesifikk']}
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
                  aria-label='Søk etter etterlevelseskrav'
                  placeholder=''
                  components={{ DropdownIndicator }}
                  noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                  controlShouldRenderValue={false}
                  loadingMessage={() => 'Søker...'}
                  isClearable={false}
                  loadOptions={useSearchKravToOptionsPvk}
                  onChange={(value: any) => {
                    if (value) {
                      const exists = fieldArrayRenderProps.form.values.relevanteKravNummer?.some(
                        (krav: IKravReference) =>
                          krav.kravNummer === value.kravNummer &&
                          krav.kravVersjon === value.kravVersjon
                      )
                      if (!exists) {
                        fieldArrayRenderProps.push(value)
                      }
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

    {generelScenarioFormValue && relevanteKravNummerFormValue.length !== 0 && (
      <Alert variant='info' className='mt-5'>
        <BodyLong>
          Dere har valgt å avkoble dette risikoscenarioet fra følgende etterlevelseskrav:
        </BodyLong>{' '}
        <List>
          {relevanteKravNummerFormValue.map((relevanteKrav, index) => (
            <List.Item key={`${index}_${relevanteKrav.navn}`}>
              {kravNummerView(relevanteKrav.kravVersjon, relevanteKrav.kravNummer)}{' '}
              {relevanteKrav.navn}
            </List.Item>
          ))}
        </List>
        <BodyLong>
          Fordi risikoscenarioet ikke er koblet til andre krav, vil det nå synes som “øvrig”
          scenario på Identifisering av risikoscenarioer og tiltak.
        </BodyLong>
      </Alert>
    )}

    {isOvrigScenario && !generelScenarioFormValue && relevanteKravNummerFormValue.length !== 0 && (
      <Alert variant='info' className='mt-5'>
        Dere har valgt å koble dette risikoscenarioet til etterlevelseskrav. Når dere lagrer denne
        endringen, vil risikoscenarioet forsvinne fra listen over “øvrige” krav. Scenarioet finner
        dere på de kravsidene som dere velger her. Husk at det også er mulig å legge til aktuelle
        risikoscenarioer fra selve kravsiden.
      </Alert>
    )}

    {!generelScenarioFormValue && relevanteKravNummerFormValue.length > 1 && (
      <Alert variant='info' className='mt-5'>
        Fordi dere har valgt at dette risikoscenarioet skal høre til flere krav, vil scenarioet nå
        også finnes under gjeldende krav.
      </Alert>
    )}
  </div>
)
