import { FormControl } from 'baseui/form-control'
import { Field, FieldProps } from 'formik'
import { useSearchKrav, useKrav } from '../../api/KravApi'
import { kravName } from '../../pages/KravPage'
import CustomizedSelect from '../common/CustomizedSelect'

export const SearchKrav = (props: { kravNummer: number; kravVersjon: number }) => {
  const [results, setSearch, loading] = useSearchKrav()
  const [krav, setKrav] = useKrav(props, true)

  return (
    <Field name={'kravNummer'}>
      {(p: FieldProps<string>) => {
        return (
          <FormControl label={'Krav'} error={p.meta.error}>
            <CustomizedSelect
              placeholder={'Søk krav'}
              maxDropdownHeight="400px"
              filterOptions={(o) => o}
              searchable
              noResultsMsg="Ingen resultat"
              options={results.map((k) => ({ id: k.id, label: kravName(k) }))}
              value={krav ? [{ id: krav.id, label: kravName(krav) }] : []}
              onChange={({ value }) => {
                const kravSelect = value.length ? results.find((k) => k.id === value[0].id)! : undefined
                setKrav(kravSelect)
                p.form.setFieldValue('kravNummer', kravSelect?.kravNummer)
                p.form.setFieldValue('kravVersjon', kravSelect?.kravVersjon)
              }}
              onInputChange={(event) => setSearch(event.currentTarget.value)}
              isLoading={loading}
            />
          </FormControl>
        )
      }}
    </Field>
  )
}
export default SearchKrav