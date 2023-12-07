import { FieldWrapper } from '../../common/Inputs'
import React from 'react'
import { FieldArray } from 'formik'
import { Error } from '../../common/ModalSchema'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { useSearchKrav } from '../../../api/KravApi'
import { Chips } from '@navikt/ds-react'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator } from './KravBegreperEdit'
import { CSSObjectWithLabel } from 'react-select'

export const EditKravRelasjoner = () => {
  return (
    <FieldWrapper>
      <FieldArray name="kravRelasjoner">
        {(p) => {
          return (
            <div>
              <LabelWithTooltip label={'Relasjoner til andre krav'} tooltip={'Legg ved lenke til relasjoner til andre krav'} />
              <AsyncSelect
                aria-label="Søk etter krav"
                placeholder="Søk etter krav"
                components={{ DropdownIndicator }}
                noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
                controlShouldRenderValue={false}
                loadingMessage={() => 'Søker...'}
                isClearable={false}
                loadOptions={useSearchKrav}
                onChange={(krav) => {
                  krav && p.push(krav)
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    cursor: 'text',
                    height: '48px',
                  } as CSSObjectWithLabel),
                }}
              />

              <Chips className="mt-2.5">
                {p.form.values.kravRelasjoner.map((kr: any, index: number) => (
                  <Chips.Removable key={kr.id} variant="neutral" onDelete={() => p.remove(index)}>
                    {`K${kr.kravNummer}.${kr.kravVersjon}`}
                  </Chips.Removable>
                ))}
              </Chips>
            </div>
          )
        }}
      </FieldArray>
      <Error fieldName="kravRelasjoner" fullWidth />
    </FieldWrapper>
  )
}
