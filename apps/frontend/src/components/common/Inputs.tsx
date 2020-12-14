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
import {Radio, RadioGroup} from 'baseui/radio'

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

const YES = 'YES', NO = 'NO', UNCLARIFIED = 'UNCLARIFIED'
const boolToRadio = (bool?: boolean) => bool === undefined ? UNCLARIFIED : bool ? YES : NO
const radioToBool = (radio: string) => radio === UNCLARIFIED ? undefined : radio === YES
export const BoolField = (props: {label: string, name: string, nullable?: boolean}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <RadioGroup value={boolToRadio(p.field.value)} align='horizontal'
                    overrides={{RadioGroupRoot: {style: {width: '100%', justifyContent: 'stretch'}}}}
                    onChange={
                      (e) => {
                        p.form.setFieldValue(props.name, radioToBool((e.target as HTMLInputElement).value))
                      }
                    }
        >
          <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={YES}>Ja</Radio>
          <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={NO}>Nei</Radio>
          {props.nullable && <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={UNCLARIFIED}>Uavklart</Radio>}
        </RadioGroup>
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
  const inputRef = React.useRef<HTMLInputElement>(null)

  let onClick = (p: FieldArrayRenderProps, i: number) => {
    setVal(p.form.values[props.name][i])
    p.remove(i)
    inputRef?.current?.focus()
  }

  return (
    <FieldArray name={props.name}>{(p: FieldArrayRenderProps) => {
      const add = () => {
        if (!val) return
        p.push(val)
        setVal('')
      }
      const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()

      return (
        <FormControl label={props.label} error={p.form.errors[props.name]}>
          <Block>
            <Block display='flex'>
              <Input onKeyDown={onKey} value={val} inputRef={inputRef}
                     onChange={e => setVal((e.target as HTMLInputElement).value)}
                     onBlur={add}
              />
              <Button type='button' onClick={add} marginLeft><FontAwesomeIcon icon={faPlus}/> </Button>
            </Block>
            <RenderTagList
              wide
              list={p.form.values[props.name] as string[]}
              onRemove={p.remove}
              onClick={(i) => onClick(p, i)}/>
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
export const MultiOptionField = (props: {label: string, name: string} & Or<{options: Value}, {listName: ListName}>) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <FieldArray name={props.name}>
      {(p: FieldArrayRenderProps) => {
        const selectedIds = (p.form.values[props.name] as any[]).map(v => props.listName ? (v as Code).code : v)
        return <FormControl label={props.label} error={p.form.errors[props.name]}>
          <Block>
            <Block display='flex'>
              <Select
                placeholder={'Velg ' + _.lowerFirst(props.label)}
                maxDropdownHeight='400px'

                options={options.filter(o => selectedIds.indexOf(o.id) < 0)}
                onChange={({value}) => {
                  value.length && p.push(props.listName ? codelist.getCode(props.listName, value[0].id as string) : value[0].id)
                }}
              />
            </Block>
            <RenderTagList list={selectedIds.map(v => options.find(o => o.id === v)?.label)} onRemove={p.remove} wide/>
          </Block>
        </FormControl>
      }
      }
    </FieldArray>
  )
}


export const MultiSearchField = (props: {label: string, name: string, search: SearchType, itemLabel?: (id: string) => React.ReactNode}) => {
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

                options={results.filter(o => (p.form.values[props.name] as any[]).indexOf(o.id) < 0)}
                onChange={({value}) => {
                  value.length && p.push(value[0].id)
                }}
                onInputChange={event => setSearch(event.currentTarget.value)}
                isLoading={loading}
              />
            </Block>
            <RenderTagList list={(p.form.values[props.name] as string[])
            .map(v => props.itemLabel ? props.itemLabel(v) : v)} onRemove={p.remove} wide/>
          </Block>
        </FormControl>
      }
    </FieldArray>
  )
}


export const SearchField = (props: {label: string, name: string, search: SearchType, itemLabel?: (id: string) => string}) => {
  const [results, setSearch, loading] = props.search

  return (
    <Field name={props.name}>
      {(p: FieldProps<string>) =>
        <FormControl label={props.label} error={p.meta.error}>
          <Select
            placeholder={'Søk ' + _.lowerFirst(props.label)}
            maxDropdownHeight='400px'
            filterOptions={o => o}
            searchable
            noResultsMsg='Ingen resultat'

            options={results}
            value={[{id: p.field.value, label: props.itemLabel ? props.itemLabel(p.field.value) : p.field.value}]}
            onChange={({value}) => {
              p.form.setFieldValue(props.name, value.length ? value[0].id as string : '')
            }}
            onInputChange={event => setSearch(event.currentTarget.value)}
            isLoading={loading}
          />
        </FormControl>
      }
    </Field>
  )
}
