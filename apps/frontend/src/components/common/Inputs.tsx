import {Krav, Or} from '../../constants'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps} from 'formik'
import {FormControl} from 'baseui/form-control'
import {Input} from 'baseui/input'
import React, {useState} from 'react'
import {Block} from 'baseui/block'
import Button from './Button'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {renderTagList} from './TagList'
import {Select, Value} from 'baseui/select'
import {Code, codelist, ListName} from '../../services/Codelist'


export const InputField = (props: {label: string, name: keyof Krav}) => (
  <Field name={props.name}>
    {(p: FieldProps) =>
      <FormControl label={props.label} error={p.meta.error}>
        <Input {...p.field}/>
      </FormControl>
    }
  </Field>
)

export const MultiInputField = (props: {label: string, name: keyof Krav}) => {
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
            {renderTagList(p.form.values[props.name] as string[], p.remove)}
          </Block>
        </FormControl>
      )
    }}
    </FieldArray>
  )
}

export const OptionField = (props: {label: string, name: keyof Krav} & Or<{options: Value}, {listName: ListName}>) => {
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
