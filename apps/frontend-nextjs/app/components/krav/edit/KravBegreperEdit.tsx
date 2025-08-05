import { useBegrepSearch } from '@/api/begrepApi.ts/BegrepApi'
import { FieldWrapper } from '@/components/common/inputs'
import LabelWithTooltip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/ModalSchema'
import { RenderTagList } from '@/components/common/taglist/TagList'
import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { MagnifyingGlassIcon } from '@navikt/aksel-icons'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { DropdownIndicatorProps, components } from 'react-select'
import AsyncSelect from 'react-select/async'


export const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <MagnifyingGlassIcon title='Søk' aria-label='Søk' />
    </components.DropdownIndicator>
  )
}

export const EditBegreper = () => {
  return (
    <FieldWrapper>
      <FieldArray name='begreper'>
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          return (
            <div>
              <LabelWithTooltip
                label={'Begreper'}
                tooltip={'Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'}
              />
              <AsyncSelect
                aria-label='Søk etter begrep'
                placeholder='Søk etter begrep'
                components={{ DropdownIndicator }}
                noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                controlShouldRenderValue={false}
                loadingMessage={() => 'Søker...'}
                isClearable={false}
                loadOptions={useBegrepSearch}
                onChange={(begrep) => {
                  if (begrep) {
                    fieldArrayRenderProps.push(begrep)
                  }
                }}
                styles={selectOverrides}
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
      <FormError fieldName='begreper' akselStyling />
    </FieldWrapper>
  )
}
