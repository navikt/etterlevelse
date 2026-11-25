import { Chips } from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import AsyncSelect from 'react-select/async'
import { useSearchKrav } from '@/api/krav/kravApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'

export const KravEditRelasjoner = () => (
  <FieldWrapper>
    <FieldArray name='kravRelasjoner'>
      {(fieldArrayRenderProps: FieldArrayRenderProps) => (
        <div>
          <LabelWithDescription
            label='Velg eventuelt andre krav med relasjon til dette kravet'
            description='Skriv minst 3 tegn for å søke'
          />
          <AsyncSelect
            aria-label='Søk etter krav'
            placeholder='Søk etter krav'
            tabSelectsValue={false}
            components={{ DropdownIndicator }}
            noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
            controlShouldRenderValue={false}
            loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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
