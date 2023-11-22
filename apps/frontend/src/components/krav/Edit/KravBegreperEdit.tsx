import { FieldWrapper } from '../../common/Inputs'
import { useBegrepSearch } from '../../../api/BegrepApi'
import React from 'react'
import { FieldArray } from 'formik'
import { intl } from '../../../util/intl/intl'
import { TYPE } from 'baseui/select'
import { FormControl } from 'baseui/form-control'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { Begrep } from '../../../constants'
import { Block } from 'baseui/block'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { borderWidth } from '../../common/Style'

export const EditBegreper = () => {
  const [result, setSearch, loading] = useBegrepSearch()

  return (
    <FieldWrapper>
      <FieldArray name="begreper">
        {(p) => {
          return (
            <FormControl label={<LabelWithTooltip label={'Begreper'} tooltip={'Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'} />}>
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
                  options={result}
                  placeholder={'Begreper'}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    let term = params.value.length ? params.value[0] : undefined
                    term && p.push(term)
                  }}
                  error={!!p.form.errors.begreper && !!p.form.submitCount}
                  isLoading={loading}
                />
                <RenderTagList list={p.form.values.begreper.map((b: Begrep) => b.navn)} onRemove={p.remove} />
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
      <Error fieldName="begreper" fullWidth />
    </FieldWrapper>
  )
}
