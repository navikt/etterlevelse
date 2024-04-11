import { FieldWrapper } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'

export const EditVirkemidler = () => {
  // const [result, setSearch, loading] = useSearchVirkemiddel()

  return (
    <FieldWrapper>
      {/* <FieldArray name="virkemidler">
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          return (
              <div>
                 <LabelWithTooltip
                  label={'Legg til relevante virkemiddel'}
                  tooltip={'Velg vikemiddel(er) som er relevant for kravet i nedtrekksmenyen. \n'}
                />
                <CustomizedSelect
                  labelKey={'navn'}
                  noResultsMsg={intl.emptyTable}
                  options={result}
                  placeholder={'Virkemidler'}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  onChange={(params) => {
                    const virkemiddel = params.value.length ? params.value[0] : undefined
                    virkemiddel && fieldArrayRenderProps.push(virkemiddel)
                  }}
                  error={!!fieldArrayRenderProps.form.errors.begreper && !!fieldArrayRenderProps.form.submitCount}
                />
                <RenderTagList
                  list={fieldArrayRenderProps.form.values.virkemidler.map((virkemiddel: IVirkemiddel) => virkemiddel.navn)}
                  onRemove={fieldArrayRenderProps.remove}
                />
              </div>
          )
        }}
      </FieldArray> */}
      <FormError fieldName="virkemidler" />
    </FieldWrapper>
  )
}
