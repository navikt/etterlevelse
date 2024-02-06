/* TODO USIKKER */
import { FormControl } from 'baseui/form-control'
import { TYPE } from 'baseui/select'
import { FieldArray } from 'formik'
import { useSearchVirkemiddel } from '../../../api/VirkemiddelApi'
import { IVirkemiddel } from '../../../constants'
import { intl } from '../../../util/intl/intl'
import { searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { FieldWrapper } from '../../common/Inputs'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { borderWidth } from '../../common/Style'
import { RenderTagList } from '../../common/TagList'

export const EditVirkemidler = () => {
  const [result, setSearch, loading] = useSearchVirkemiddel()

  return (
    <FieldWrapper>
      <FieldArray name="virkemidler">
        {(p) => (
          <FormControl
            label={
              <LabelWithTooltip
                label={'Legg til relevante virkemiddel'}
                tooltip={'Velg vikemiddel(er) som er relevant for kravet i nedtrekksmenyen. \n'}
              />
            }
          >
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
                labelKey={'navn'}
                noResultsMsg={intl.emptyTable}
                maxDropdownHeight="350px"
                searchable={true}
                type={TYPE.search}
                options={result}
                placeholder={'Virkemidler'}
                onInputChange={(event) => setSearch(event.currentTarget.value)}
                onChange={(params) => {
                  const virkemiddel = params.value.length ? params.value[0] : undefined
                  virkemiddel && p.push(virkemiddel)
                }}
                error={!!p.form.errors.begreper && !!p.form.submitCount}
                isLoading={loading}
              />
              <RenderTagList
                list={p.form.values.virkemidler.map((v: IVirkemiddel) => v.navn)}
                onRemove={p.remove}
              />
            </div>
          </FormControl>
        )}
      </FieldArray>
      <FormError fieldName="virkemidler" />
    </FieldWrapper>
  )
}
