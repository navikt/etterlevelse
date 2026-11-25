import { FieldArray, FieldArrayRenderProps } from 'formik'
import AsyncSelect from 'react-select/async'
import { useBegrepSearch } from '@/api/begrep/begrepApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { IBegrep } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'

export const EditBegreper = () => (
  <FieldWrapper>
    <FieldArray name='begreper'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <div>
          <LabelWithDescription
            label='Legg til relevante begreper fra Begrepskatalogen'
            description='Skriv minst 3 tegn for å søke'
          />
          <AsyncSelect
            aria-label='Søk etter begrep'
            placeholder='Søk etter begrep'
            tabSelectsValue={false}
            components={{ DropdownIndicator }}
            noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
            controlShouldRenderValue={false}
            loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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
