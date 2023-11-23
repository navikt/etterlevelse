import { FieldWrapper } from '../../common/Inputs'
import React from 'react'
import { FieldArray } from 'formik'
import { intl } from '../../../util/intl/intl'
import { TYPE } from 'baseui/select'
import { FormControl } from 'baseui/form-control'
import { Error } from '../../common/ModalSchema'
import { Krav } from '../../../constants'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { borderWidth } from '../../common/Style'
import { useSearchKrav } from '../../../api/KravApi'
import { Chips } from '@navikt/ds-react'
import AsyncSelect from 'react-select/async'

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
                    height: '48px'
                  })
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
