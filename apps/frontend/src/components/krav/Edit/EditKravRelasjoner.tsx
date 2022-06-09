import { FieldWrapper } from '../../common/Inputs'
import React, { useEffect, useState } from 'react'
import { FieldArray } from 'formik'
import { intl } from '../../../util/intl/intl'
import { TYPE, Value } from 'baseui/select'
import { FormControl } from 'baseui/form-control'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { Krav } from '../../../constants'
import { Block } from 'baseui/block'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { borderWidth } from '../../common/Style'
import { useMainSearch } from '../../search/MainSearch'
import { useQueryParam } from '../../../util/hooks'
import { ObjectType } from '../../admin/audit/AuditTypes'

export const EditKravRelasjoner = () => {
  const searchParam = useQueryParam('search')
  const [setSearch, searchResult, loading, type, setType] = useMainSearch(searchParam)

  useEffect(() => {
    setType(ObjectType.Krav)
  })

  return (
    <FieldWrapper>
      <FieldArray name="kravRelasjoner">
        {(p) => {
          return (
            <FormControl label={<LabelWithTooltip label={'Relasjoner til andre krav'} tooltip={'Legg ved lenke til relasjoner til andre krav'} />}>
              <Block>
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
                  labelKey={'navn'}
                  noResultsMsg={intl.emptyTable}
                  maxDropdownHeight="350px"
                  searchable={true}
                  type={TYPE.search}
                  options={searchResult}
                  placeholder={'Krav'}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    let krav = params.value.length ? params.value[0] : undefined
                    krav && p.push(krav)
                  }}
                  error={!!p.form.errors.begreper && !!p.form.submitCount}
                  isLoading={loading}
                />
                <RenderTagList wide list={p.form.values.kravRelasjoner.map((kr: Partial<Krav>) => `K${kr.kravNummer}.${kr.kravVersjon}`)} onRemove={p.remove} />
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
      <Error fieldName="kravRelasjoner" fullWidth />
    </FieldWrapper>
  )
}
