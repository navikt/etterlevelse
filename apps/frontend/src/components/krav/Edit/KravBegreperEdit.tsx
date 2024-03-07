import { MagnifyingGlassIcon } from '@navikt/aksel-icons'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { CSSObjectWithLabel, DropdownIndicatorProps, components } from 'react-select'
import AsyncSelect from 'react-select/async'
import { useBegrepSearch } from '../../../api/BegrepApi'
import { IBegrep } from '../../../constants'
import { ettlevColors } from '../../../util/theme'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'

export const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <MagnifyingGlassIcon title="Søk" aria-label="Søk" />
    </components.DropdownIndicator>
  )
}

export const EditBegreper = () => {
  return (
    <FieldWrapper>
      <FieldArray name="begreper">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          return (
            <div>
              <LabelWithTooltip
                label={'Begreper'}
                tooltip={'Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'}
              />
              <AsyncSelect
                aria-label="Søk etter begrep"
                placeholder="Søk etter begrep"
                components={{ DropdownIndicator }}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length < 3
                    ? 'Skriv minst tre tegn for å søke'
                    : `Fant ingen resultater for "${inputValue}"`
                }
                controlShouldRenderValue={false}
                loadingMessage={() => 'Søker...'}
                isClearable={false}
                loadOptions={useBegrepSearch}
                onChange={(begrep) => {
                  begrep && fieldArrayRenderProps.push(begrep)
                }}
                styles={{
                  control: (base) =>
                    ({
                      ...base,
                      cursor: 'text',
                      height: '3rem',
                      borderColor: ettlevColors.textAreaBorder,
                    }) as CSSObjectWithLabel,
                }}
              />

              <RenderTagList
                list={fieldArrayRenderProps.form.values.begreper.map(
                  (begrep: IBegrep) => begrep.navn
                )}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )
        }}
      </FieldArray>
      <FormError fieldName="begreper" akselStyling />
    </FieldWrapper>
  )
}
