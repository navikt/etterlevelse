import { FieldWrapper } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'

export const EditVirkemidler = () => {
  // const [result, setSearch, loading] = useSearchVirkemiddel()

  return (
    <FieldWrapper>
      {/* <FieldArray name="virkemidler">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          return (
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
                    virkemiddel && fieldArrayRenderProps.push(virkemiddel)
                  }}
                  error={!!fieldArrayRenderProps.form.errors.begreper && !!fieldArrayRenderProps.form.submitCount}
                  isLoading={loading}
                />
                <RenderTagList
                  list={fieldArrayRenderProps.form.values.virkemidler.map((virkemiddel: IVirkemiddel) => virkemiddel.navn)}
                  onRemove={fieldArrayRenderProps.remove}
                />
              </div>
            </FormControl>
          )
        }}
      </FieldArray> */}
      <FormError fieldName="virkemidler" />
    </FieldWrapper>
  )
}
