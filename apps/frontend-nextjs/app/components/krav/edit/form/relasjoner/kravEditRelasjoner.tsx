import { useSearchKrav } from '@/api/krav/kravApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithToolTip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Chips } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import AsyncSelect from 'react-select/async'

export const KravEditRelasjoner = () => (
  <FieldWrapper>
    <FieldArray name='kravRelasjoner'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <div>
          <LabelWithToolTip
            label={'Relasjoner til andre krav'}
            tooltip={'Legg ved lenke til relasjoner til andre krav'}
          />
          <AsyncSelect
            aria-label='Søk etter krav'
            placeholder='Søk etter krav'
            components={{ DropdownIndicator }}
            noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
            controlShouldRenderValue={false}
            loadingMessage={() => 'Søker...'}
            isClearable={false}
            loadOptions={useSearchKrav}
            onChange={(krav) => {
              if (krav) {
                fieldArrayRenderProps.push(krav)
              }
            }}
            styles={selectOverrides}
          />

          <Chips className='mt-2.5'>
            {fieldArrayRenderProps.form.values.kravRelasjoner.map(
              (kravRelasjon: any, index: number) => (
                <Chips.Removable
                  key={kravRelasjon.id}
                  variant='neutral'
                  onDelete={() => fieldArrayRenderProps.remove(index)}
                >
                  {`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}
                </Chips.Removable>
              )
            )}
          </Chips>
        </div>
      )}
    </FieldArray>
    <FormError fieldName='kravRelasjoner' akselStyling />
  </FieldWrapper>
)
