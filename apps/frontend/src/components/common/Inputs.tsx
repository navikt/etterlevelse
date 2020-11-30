import {Or} from '../../constants'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps} from 'formik'
import {FormControl} from 'baseui/form-control'
import {Input} from 'baseui/input'
import React, {useState} from 'react'
import {Block} from 'baseui/block'
import Button from './Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {RenderTagList} from './TagList'
import {Select, Value} from 'baseui/select'
import {Code, codelist, ListName} from '../../services/Codelist'
import {SearchType} from '../../api/TeamApi'
import * as _ from 'lodash'
import {Textarea} from 'baseui/textarea'
import {Datepicker} from 'baseui/datepicker'
import moment from 'moment'

export const InputField = (props: {label: string, name: string}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <Input {...p.field}/>
      </FormControl>
    }
  </Field>
)

export const TextAreaField = (props: {label: string, name: string}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <Textarea rows={6} {...p.field}/>
      </FormControl>
    }
  </Field>
)

export const DateField = (props: {label: string, name: string}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <Datepicker
          formatString={'dd-MM-yyyy'}
          value={p.field.value ? moment(p.field.value).toDate() : undefined}
          onChange={({date}) => {
          const dateSingle = Array.isArray(date) ? date[0] : date
          if (dateSingle) p.form.setFieldValue(props.name, dateSingle.toISOString().split('T')[0])
        }}/>
      </FormControl>
    }
  </Field>
)

export const MultiInputField = (props: {label: string, name: string}) => {
  const [val, setVal] = useState('')
  return (
    <FieldArray name={props.name}>{(p: FieldArrayRenderProps) => {
      const add = () => {
        p.push(val);
        setVal('')
      }
      const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter' && val) && add()

      return (
        <FormControl label={props.label} error={p.form.errors[props.name]}>
          <Block>
            <Block display='flex'>
              <Input onKeyDown={onKey} value={val}
                     onChange={e => setVal((e.target as HTMLInputElement).value)}
              />
              <Button type='button' onClick={add} marginLeft><FontAwesomeIcon icon={faPlus}/> </Button>
            </Block>
            <RenderTagList list={p.form.values[props.name] as string[]} onRemove={p.remove}/>
          </Block>
        </FormControl>
      )
    }}
    </FieldArray>
  )
}

export const OptionField = (props: {label: string, name: string} & Or<{options: Value}, {listName: ListName}>) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <Field name={props.name}>
      {(p: FieldProps<string | Code>) =>
        <FormControl label={props.label} error={p.meta.error}>
          <Select options={options}
                  value={options.filter(o => o.id === (props.listName ? (p.field.value as Code | undefined)?.code : p.field.value))}
                  onChange={s => {
                    const val = s.option?.id
                    const toSet = props.listName && val ? codelist.getCode(props.listName, val as string) : val
                    return p.form.setFieldValue(props.name, toSet)
                  }}
          />
        </FormControl>
      }
    </Field>
  )
}

export const MultiSearchField = (props: {label: string, name: string, search: SearchType, itemLabel?: (id: string) => string}) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldArray name={props.name}>
      {(p: FieldArrayRenderProps) =>
        <FormControl label={props.label} error={p.form.errors[props.name]}>
          <Block>
            <Block display='flex'>
              <Select
                placeholder={'Søk ' + _.lowerFirst(props.label)}
                maxDropdownHeight='400px'
                filterOptions={o => o}
                searchable
                noResultsMsg='Ingen resultat'

                options={results}
                onChange={({value}) => {
                  value.length && p.push(value[0].id)
                }}
                onInputChange={event => setSearch(event.currentTarget.value)}
                isLoading={loading}
              />
            </Block>
            <RenderTagList list={(p.form.values[props.name] as string[])
            .map(v => props.itemLabel ? props.itemLabel(v) : v)} onRemove={p.remove}/>
          </Block>
        </FormControl>
      }
    </FieldArray>
  )
}
