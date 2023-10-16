import { FieldWrapper } from '../../common/Inputs'
import React from 'react'
import { FieldArray } from 'formik'
import { intl } from '../../../util/intl/intl'
import { TYPE } from 'baseui/select'
import { FormControl } from 'baseui/form-control'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { Block } from 'baseui/block'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { borderWidth } from '../../common/Style'
import { useSearchVirkemiddel } from '../../../api/VirkemiddelApi'
import { Virkemiddel } from '../../../constants'

export const EditVirkemidler = () => {
  const [result, setSearch, loading] = useSearchVirkemiddel()

  return (
    <FieldWrapper>
      <FieldArray name="virkemidler">
        {(p) => {
          return (
            <FormControl label={<LabelWithTooltip label={'Legg til relevante virkemiddel'} tooltip={'Velg vikemiddel(er) som er relevant for kravet i nedtrekksmenyen. \n'} />}>
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
                  placeholder={'Virkemidler'}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    let virkemiddel = params.value.length ? params.value[0] : undefined
                    virkemiddel && p.push(virkemiddel)
                  }}
                  error={!!p.form.errors.begreper && !!p.form.submitCount}
                  isLoading={loading}
                />
                <RenderTagList wide list={p.form.values.virkemidler.map((v: Virkemiddel) => v.navn)} onRemove={p.remove} />
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
      <Error fieldName="virkemidler" fullWidth />
    </FieldWrapper>
  )
}
