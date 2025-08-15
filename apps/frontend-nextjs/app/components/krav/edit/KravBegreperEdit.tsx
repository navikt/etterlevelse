import { useBegrepSearch } from '@/api/begrep/begrepApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithTooltip from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { DropdownIndicator } from '@/components/etterlevelse/edit/dropdownIndicator/dropdownIndicator'
import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import AsyncSelect from 'react-select/async'

export const EditBegreper = () => (
  <FieldWrapper>
    <FieldArray name='begreper'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <div>
          <LabelWithTooltip
            label='Begreper'
            tooltip='Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'
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
            list={fieldArrayRenderProps.form.values.begreper.map((begrep: IBegrep) => begrep.navn)}
            onRemove={fieldArrayRenderProps.remove}
          />
        </div>
      )}
    </FieldArray>
    <FormError fieldName='begreper' akselStyling />
  </FieldWrapper>
)
