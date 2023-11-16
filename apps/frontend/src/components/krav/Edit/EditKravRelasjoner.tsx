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
import {Chips} from "@navikt/ds-react";

export const EditKravRelasjoner = () => {
  const [searchResult, setSearch, loading] = useSearchKrav()

  return (
    <FieldWrapper>
      <FieldArray name="kravRelasjoner">
        {(p) => {
          return (
            <FormControl label={<LabelWithTooltip label={'Relasjoner til andre krav'} tooltip={'Legg ved lenke til relasjoner til andre krav'} />}>
              <div>

                <CustomizedSelect
                  overrides={{
                    SearchIcon: {
                      component: () => <img src={searchIcon} alt="search icon" />,
                      style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                      },
                    },
                    SearchIconContainer: {
                      style: {
                        width: 'calc(100% - 20px)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      },
                    },
                    IconsContainer: {
                      style: {
                        marginRight: '20px',
                      },
                    },
                    ValueContainer: {
                      style: {
                        paddingLeft: '10px',
                      },
                    },
                    ControlContainer: {
                      style: {
                        ...borderWidth('2px'),
                      },
                    },
                  }}
                  noResultsMsg={intl.emptyTable}
                  maxDropdownHeight="350px"
                  searchable={true}
                  type={TYPE.search}
                  options={searchResult.map((k) => {
                    return {
                      id: k.id,
                      label: 'K' + k.kravNummer + '.' + k.kravVersjon + ' - ' + k.navn,
                      navn: k.navn,
                      kravNummer: k.kravNummer,
                      kravVersjon: k.kravVersjon,
                    }
                  })}
                  placeholder={'Krav'}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    let krav = params.value.length ? params.value[0] : undefined
                    krav && p.push(krav)
                  }}
                  error={!!p.form.errors.begreper && !!p.form.submitCount}
                  isLoading={loading}
                />

                 <Chips>{p.form.values.kravRelasjoner.map((kr: any, index: number) => (
                  <Chips.Removable
                    key={kr.id}
                    variant="action"
                    onDelete={() => p.remove(index)}
                  >
                      {`K${kr.kravNummer}.${kr.kravVersjon}`}
                 </Chips.Removable>
                  ))}
                   </Chips>
              </div>
            </FormControl>
          )
        }}
      </FieldArray>
      <Error fieldName="kravRelasjoner" fullWidth />
    </FieldWrapper>
  )
}
