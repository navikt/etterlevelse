import {FieldWrapper} from '../../common/Inputs'
import {useBegrepSearch} from '../../../api/BegrepApi'
import React from 'react'
import {FieldArray} from 'formik'
import {intl} from '../../../util/intl/intl'
import {Select, TYPE} from 'baseui/select'
import {FormControl} from 'baseui/form-control'
import {Error} from '../../common/ModalSchema'
import {RenderTagList} from '../../common/TagList'
import {Begrep} from '../../../constants'
import {Block} from 'baseui/block'

export const EditBegreper = () => {
  const [result, setSearch, loading] = useBegrepSearch()

  return (
    <FieldWrapper>
      <FieldArray name='begreper'>
        {p => {
          return (
            <FormControl label='Begreper' caption={'Legg ved lenke til relevante begrep(er) i Begrepskatalogen.'}>
              <Block>
                <Select
                  labelKey={'navn'}
                  noResultsMsg={intl.emptyTable}
                  maxDropdownHeight="350px"
                  searchable={true}
                  type={TYPE.search}
                  options={result}
                  placeholder={'Begreper'}
                  onInputChange={event => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    let term = params.value.length ? params.value[0] : undefined
                    term && p.push(term)
                  }}
                  error={!!p.form.errors.begreper && !!p.form.submitCount}
                  isLoading={loading}
                />
                <RenderTagList wide list={p.form.values.begreper.map((b: Begrep) => b.navn)} onRemove={p.remove}/>
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
      <Error fieldName="begreper" fullWidth/>
    </FieldWrapper>
  )
}
