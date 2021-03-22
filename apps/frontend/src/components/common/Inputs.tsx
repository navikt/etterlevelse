import {Or} from '../../constants'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps} from 'formik'
import {FormControl} from 'baseui/form-control'
import {Input} from 'baseui/input'
import React, {ReactNode, useState} from 'react'
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
import {MarkdownEditor} from './Markdown'
import {ExternalLink} from './RouteLink'

export const FieldWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <Block marginBottom='1.5rem'>
      {children}
    </Block>
  )
}

export const InputField = (props: {label: string, name: string, caption?: ReactNode}) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) =>
        <FormControl label={props.label} error={p.meta.touched && p.meta.error} caption={props.caption}>
          <Input {...p.field}/>
        </FormControl>
      }
    </Field>
  </FieldWrapper>
)

export const TextAreaField = (props: {label: string, name: string, markdown?: boolean, shortenLinks?: boolean, onImageUpload?: (file: File) => Promise<string>, caption?: ReactNode}) => {
  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps) =>
          <FormControl label={props.label} error={p.meta.touched && p.meta.error}
                       caption={props.markdown ?
                         <Block display='flex' flexDirection={'column'}>
                           {props.caption}
                           <Block>Feltet bruker <ExternalLink href='https://guides.github.com/features/mastering-markdown/'>Markdown</ExternalLink>, se her for mer
                             informasjon om formatet
                           </Block>
                         </Block>
                         : props.caption}>
            <>
              {props.markdown && <MarkdownEditor initialValue={p.field.value} setValue={v => p.form.setFieldValue(props.name, v)}
                                                 onImageUpload={props.onImageUpload} shortenLinks={props.shortenLinks}/>}
              {!props.markdown && <Textarea rows={8} {...p.field}/>}
            </>
          </FormControl>
        }
      </Field>
    </FieldWrapper>
  )
}

const YES = 'YES', NO = 'NO', UNCLARIFIED = 'UNCLARIFIED'
const boolToRadio = (bool?: boolean) => bool === undefined ? UNCLARIFIED : bool ? YES : NO
const radioToBool = (radio: string) => radio === UNCLARIFIED ? undefined : radio === YES
export const BoolField = (props: {label: string, name: string, nullable?: boolean}) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) =>
        <FormControl label={props.label} error={p.meta.touched && p.meta.error}>
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
  </FieldWrapper>
)

export const DateField = (props: {label: string, name: string, caption?: ReactNode}) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) =>
        <FormControl label={props.label} error={p.meta.touched && p.meta.error} caption={props.caption}>
          <Datepicker
            clearable
            formatString={'dd-MM-yyyy'}
            value={p.field.value ? moment(p.field.value).toDate() : undefined}
            onChange={({date}) => {
              const dateSingle = Array.isArray(date) ? date[0] : date
              if (dateSingle) p.form.setFieldValue(props.name, dateSingle.toISOString().split('T')[0])
              else p.form.setFieldValue(props.name, undefined)
            }}/>
        </FormControl>
      }
    </Field>
  </FieldWrapper>
)

const linkReg = /\[(.+)\]\((.+)\)/i
const linkNameFor = (t: string) => {
  const groups = t.match(linkReg)
  if (groups) return groups[1]
  return t
}

export const MultiInputField = (props: {label: string, name: string, link?: boolean, caption?: ReactNode}) => {
  const [val, setVal] = useState('')
  const [linkName, setLinkName] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  let onClick = (p: FieldArrayRenderProps, i: number) => {
    const oldVal = p.form.values[props.name][i]
    const groups = oldVal.match(linkReg)
    if (groups) {
      setVal(groups[2])
      setLinkName(groups[1])
    } else {
      setVal(oldVal)
    }
    p.remove(i)
    inputRef?.current?.focus()
  }

  return (
    <FieldWrapper>
      <FieldArray name={props.name}>{(p: FieldArrayRenderProps) => {
        const add = () => {
          if (!val) return
          if (linkName) {
            p.push(`[${linkName}](${val})`)
          } else
            p.push(val)
          setVal('')
          setLinkName('')
        }
        const onKey = (e: React.KeyboardEvent) => (e.key === 'Enter') && add()

        return (
          <FormControl label={props.label} error={p.form.touched[props.name] && p.form.errors[props.name]} caption={props.caption}>
            <Block>
              <Block display='flex'>
                <Input onKeyDown={onKey} value={val} inputRef={inputRef}
                       onChange={e => setVal((e.target as HTMLInputElement).value)}
                       onBlur={!props.link ? add : undefined}
                       placeholder={props.link ? 'Lenke eller tekst' : 'Tekst'}
                />
                {props.link &&
                <Input onKeyDown={onKey} value={linkName}
                       onChange={e => setLinkName((e.target as HTMLInputElement).value)}
                       placeholder={'Lenkenavn'}
                />
                }
                <Button type='button' onClick={add} marginLeft><FontAwesomeIcon icon={faPlus}/> </Button>
              </Block>
              <RenderTagList
                wide
                list={(p.form.values[props.name] as string[]).map(linkNameFor)}
                onRemove={p.remove}
                onClick={(i) => onClick(p, i)}/>
            </Block>
          </FormControl>
        )
      }}
      </FieldArray>
    </FieldWrapper>
  )
}

export const OptionField = (props: {label: string, name: string, clearable?: boolean, caption?: ReactNode} & Or<{options: Value}, {listName: ListName}>) => {
  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps<string | Code>) =>
          <FormControl label={props.label} error={p.meta.touched && p.meta.error} caption={props.caption}>
            <OptionList {...props} onChange={(val => p.form.setFieldValue(props.name, val))} value={p.field.value}/>
          </FormControl>
        }
      </Field>
    </FieldWrapper>
  )
}

export const OptionList = (props: {clearable?: boolean, value?: Code | string, onChange: (val?: any) => void} & Or<{options: Value}, {listName: ListName}>) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <Select options={options} clearable={props.clearable}
            value={options.filter(o => o.id === (props.listName ? (props.value as Code | undefined)?.code : props.value))}
            onChange={s => {
              const val = s.option?.id
              const toSet = props.listName && val ? codelist.getCode(props.listName, val as string) : val
              return props.onChange(toSet)
            }}
    />)
}

export const MultiOptionField = (props: {label: string, name: string, caption?: ReactNode} & Or<{options: Value}, {listName: ListName}>) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <FieldWrapper>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const selectedIds = (p.form.values[props.name] as any[]).map(v => props.listName ? (v as Code).code : v)
          return <FormControl label={props.label} error={p.form.touched[props.name] && p.form.errors[props.name]} caption={props.caption}>
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
    </FieldWrapper>
  )
}


export const MultiSearchField = (props: {label: string, name: string, search: SearchType, itemLabel?: (id: string) => React.ReactNode}) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldWrapper>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) =>
          <FormControl label={props.label} error={p.form.touched[props.name] && p.form.errors[props.name]}>
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
    </FieldWrapper>
  )
}


export const SearchField = (props: {label: string, name: string, search: SearchType, itemLabel?: (id: string) => string}) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps<string>) =>
          <FormControl label={props.label} error={p.meta.touched && p.meta.error}>
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
    </FieldWrapper>
  )
}
