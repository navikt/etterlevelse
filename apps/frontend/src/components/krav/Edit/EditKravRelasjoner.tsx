import { Chips } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import AsyncSelect from 'react-select/async'
import { useSearchKrav } from '../../../api/KravApi'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { selectOverrides } from '../../search/util'
import { DropdownIndicator } from './KravBegreperEdit'

export const EditKravRelasjoner = () => {
  return (
    <FieldWrapper>
      <FieldArray name="kravRelasjoner">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          return (
            <div>
              <LabelWithTooltip
                label={'Relasjoner til andre krav'}
                tooltip={'Legg ved lenke til relasjoner til andre krav'}
              />
              <AsyncSelect
                aria-label="Søk etter krav"
                placeholder="Søk etter krav"
                components={{ DropdownIndicator }}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 3
                    ? 'Skriv minst tre tegn for å søke'
                    : `Fant ingen resultater for "${inputValue}"`
                }
                controlShouldRenderValue={false}
                loadingMessage={() => 'Søker...'}
                isClearable={false}
                loadOptions={useSearchKrav}
                onChange={(krav) => {
                  krav && fieldArrayRenderProps.push(krav)
                }}
                styles={selectOverrides}
              />

              <Chips className="mt-2.5">
                {fieldArrayRenderProps.form.values.kravRelasjoner.map(
                  (kravRelasjon: any, index: number) => (
                    <Chips.Removable
                      key={kravRelasjon.id}
                      variant="neutral"
                      onDelete={() => fieldArrayRenderProps.remove(index)}
                    >
                      {`K${kravRelasjon.kravNummer}.${kravRelasjon.kravVersjon}`}
                    </Chips.Removable>
                  )
                )}
              </Chips>
            </div>
          )
        }}
      </FieldArray>
      <FormError fieldName="kravRelasjoner" akselStyling />
    </FieldWrapper>
  )
}
