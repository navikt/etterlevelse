import { Or } from '../../constants'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import { FormControl } from 'baseui/form-control'
import React, { ReactNode, useState } from 'react'
import { Block } from 'baseui/block'
import { RenderTagList } from './TagList'
import { Value } from 'baseui/select'
import { ICode, codelist, ListName } from '../../services/Codelist'
import { SearchType } from '../../api/TeamApi'
import * as _ from 'lodash'
import LabelWithTooltip from '../common/LabelWithTooltip'
import CustomizedSelect from '../common/CustomizedSelect'
import TextEditor from './TextEditor/TextEditor'
import { Error } from './ModalSchema'
import { MarkdownInfo } from './Markdown'
import { DatePicker, Button, Detail, Label, Select, TextField, Textarea, useDatepicker, RadioGroup, Radio } from '@navikt/ds-react'

export const FieldWrapper = ({ children, marginBottom }: { children: React.ReactNode; marginBottom?: boolean }) => {
  return <div className={`${marginBottom ? 'mb-6' : ''}`}>{children}</div>
}

export const InputField = (props: { label: string; name: string; description?: string; marginBottom?: boolean; disablePlaceHolder?: boolean }) => (
  <FieldWrapper marginBottom={props.marginBottom}>
    <Field name={props.name}>
      {(p: FieldProps) => (
        <div className="w-full">
          <TextField label={props.label} {...p.field} placeholder={!props.disablePlaceHolder ? props.label : undefined} />
          <Error fieldName={props.name} fullWidth />
        </div>
      )}
    </Field>
  </FieldWrapper>
)

export const TextAreaField = (props: {
  height?: string
  marginBottom?: boolean
  label: string
  name: string
  markdown?: boolean
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
  caption?: ReactNode
  tooltip?: string
  noPlaceholder?: boolean
  placeholder?: string
  maxCharacter?: number
  rows?: number
  setIsFormDirty?: (v: boolean) => void
}) => {
  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <Field name={props.name}>
        {(p: FieldProps) => (
          <div>
            {props.markdown && (
              <div>
                <Label>{props.label}</Label>
                <Detail>{props.caption}</Detail>
                <MarkdownInfo />
                <TextEditor
                  height={props.height}
                  initialValue={p.field.value}
                  setValue={(v) => p.form.setFieldValue(props.name, v)}
                  onImageUpload={props.onImageUpload}
                  shortenLinks={props.shortenLinks}
                  errors={p.form.errors}
                  name={props.name}
                  setIsFormDirty={props.setIsFormDirty}
                />
                {/* <MarkdownEditor initialValue={p.field.value} setValue={v => p.form.setFieldValue(props.name, v)}
                onImageUpload={props.onImageUpload} shortenLinks={props.shortenLinks} /> */}
              </div>
            )}
            {!props.markdown && (
              <Textarea
                minRows={props.rows ? props.rows : 8}
                label={props.label}
                maxLength={props.maxCharacter ? props.maxCharacter : undefined}
                {...p.field}
                placeholder={props.noPlaceholder ? '' : props.placeholder ? props.placeholder : props.label}
                onChange={(v) => {
                  if (props.setIsFormDirty) {
                    props.setIsFormDirty(true)
                  }
                  p.field.onChange(v)
                }}
              />
            )}
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

const YES = 'YES',
  NO = 'NO',
  UNCLARIFIED = 'UNCLARIFIED'
const boolToRadio = (bool?: boolean) => (bool === undefined ? UNCLARIFIED : bool ? YES : NO)
const radioToBool = (radio: string) => (radio === UNCLARIFIED ? undefined : radio === YES)
export const BoolField = (props: { label: string; name: string; nullable?: boolean; tooltip?: string }) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) => (
        <div>
          <RadioGroup
            legend={props.label}
            description={props.tooltip}
            value={boolToRadio(p.field.value)}
            onChange={(value) => {
              p.form.setFieldValue(props.name, radioToBool(value))
            }}
          >
            <Radio value={YES}>Ja</Radio>
            <Radio value={NO}>Nei</Radio>
            {props.nullable && <Radio value={UNCLARIFIED}>Uavklart</Radio>}
          </RadioGroup>
          <Error fieldName={props.name} fullWidth />
        </div>
      )}
    </Field>
  </FieldWrapper>
)

export const DateField = (props: { label: string; name: string; caption?: ReactNode; tooltip?: string; error?: boolean }) => {
  const { datepickerProps, inputProps } = useDatepicker({})

  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps) => (
          <DatePicker
            {...datepickerProps}
            onSelect={(date: any) => {
              const dateSingle: Date = Array.isArray(date) ? date[0] : date
              if (dateSingle) {
                const newDate = dateSingle.setDate(dateSingle.getDate() + 1)
                const formatedDate = new Date(newDate)
                p.form.setFieldValue(props.name, formatedDate.toISOString().split('T')[0])
              } else p.form.setFieldValue(props.name, undefined)
            }}
          >
            <DatePicker.Input {...inputProps} label="Velg dato" />
          </DatePicker>
        )}
      </Field>
    </FieldWrapper>
  )
}

const linkReg = /\[(.+)\]\((.+)\)/i
const linkNameFor = (t: string) => {
  const groups = t.match(linkReg)
  if (groups) return groups[1]
  return t
}

export const MultiInputField = (props: {
  label: string
  name: string
  link?: boolean
  linkLabel?: string
  linkTooltip?: string
  caption?: ReactNode
  tooltip?: string
  maxInputWidth?: string
  marginBottom?: boolean
  setErrors?: Function
}) => {
  const [val, setVal] = useState('')
  const [linkName, setLinkName] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const add = () => {
            if (props.link) {
              if (linkName && val) {
                p.push(`[${linkName}](${val})`)
              } else if (linkName && !val) {
                p.push(linkName)
              } else if (!linkName && !val) {
                return
              } else {
                props.setErrors && props.setErrors()
                return
              }
            } else {
              if (val) {
                p.push(val)
              } else {
                props.setErrors && props.setErrors()
                return
              }
            }
            setVal('')
            setLinkName('')
          }
          const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()

          return (
            <div>
              <div className="flex w-full items-end">
                {props.link && (
                  <div className={`w-full ${props.maxInputWidth ? 'max-w-[' + props.maxInputWidth + ']' : undefined}`}>
                    <LabelWithTooltip label={props.linkLabel} tooltip={props.linkTooltip} />
                    <TextField label={props.label} hideLabel onKeyDown={onKey} value={linkName} onChange={(e) => setLinkName((e.target as HTMLInputElement).value)} />
                  </div>
                )}
                <div className={`w-full ${props.link ? 'ml-3' : undefined} ${!props.link ? 'max-w-[' + props.maxInputWidth + ']' : undefined}`}>
                  <LabelWithTooltip label={props.label} tooltip={props.tooltip} />
                  <TextField
                    label={props.label}
                    hideLabel
                    onKeyDown={onKey}
                    value={val}
                    ref={inputRef}
                    onChange={(e) => setVal((e.target as HTMLInputElement).value)}
                    onBlur={!props.link ? add : undefined}
                  />
                </div>

                <div className="min-w-[107px] ml-2.5">
                  <Button type="button" onClick={() => add()} variant="secondary">
                    Legg til
                  </Button>
                </div>
              </div>
              <RenderTagList list={(p.form.values[props.name] as string[]).map(linkNameFor)} onRemove={p.remove} />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

export const OptionField = (
  props: { label: string; name: string; clearable?: boolean; caption?: ReactNode; tooltip?: string } & Or<{ options: Value }, { listName: ListName }>,
) => {
  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps<string>) => (
          <FormControl label={<LabelWithTooltip label={props.label} tooltip={props.tooltip} />} error={p.meta.touched && p.meta.error} caption={props.caption}>
            <OptionList {...props} onChange={(val) => p.form.setFieldValue(props.name, val)} value={p.field.value} />
          </FormControl>
        )}
      </Field>
    </FieldWrapper>
  )
}

export const OptionList = (props: { label: string; value?: string; onChange: (val?: any) => void } & Or<{ options: Value }, { listName: ListName }>) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <Select
      label={props.label}
      hideLabel
      className="w-full"
      value={props.value}
      onChange={(e) => {
        const val = e.target.value
        const toSet = props.listName && val ? codelist.getCode(props.listName, val) : val
        return props.onChange(toSet)
      }}
    >
      <option value="">Velg {props.label}</option>
      {options.map((c, i) => {
        return (
          <option key={i + '_' + c.label} value={c.id}>
            {c.label}
          </option>
        )
      })}
    </Select>
  )
}

export const MultiSearchField = (props: { label: string; name: string; search: SearchType; itemLabel?: (id: string) => string }) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldWrapper>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => (
          <FormControl label={props.label} error={p.form.touched[props.name] && <>{p.form.errors[props.name]}</>}>
            <Block>
              <Block display="flex">
                <CustomizedSelect
                  placeholder={'Søk ' + _.lowerFirst(props.label)}
                  maxDropdownHeight="400px"
                  filterOptions={(o) => o}
                  searchable
                  noResultsMsg="Ingen resultat"
                  options={results.filter((o) => (p.form.values[props.name] as any[]).indexOf(o.id) < 0)}
                  onChange={({ value }) => {
                    value.length && p.push(value[0].id)
                  }}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  isLoading={loading}
                />
              </Block>
              <RenderTagList list={(p.form.values[props.name] as string[]).map((v) => (props.itemLabel ? props.itemLabel(v) : v))} onRemove={p.remove} />
            </Block>
          </FormControl>
        )}
      </FieldArray>
    </FieldWrapper>
  )
}

export const SearchField = (props: { label: string; name: string; search: SearchType; itemLabel?: (id: string) => string }) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldWrapper>
      <Field name={props.name}>
        {(p: FieldProps<string>) => (
          <FormControl label={props.label} error={p.meta.touched && p.meta.error}>
            <CustomizedSelect
              placeholder={'Søk ' + _.lowerFirst(props.label)}
              maxDropdownHeight="400px"
              filterOptions={(o) => o}
              searchable
              noResultsMsg="Ingen resultat"
              options={results}
              value={[{ id: p.field.value, label: props.itemLabel ? props.itemLabel(p.field.value) : p.field.value }]}
              onChange={({ value }) => {
                p.form.setFieldValue(props.name, value.length ? (value[0].id as string) : '')
              }}
              onInputChange={(event) => setSearch(event.currentTarget.value)}
              isLoading={loading}
            />
          </FormControl>
        )}
      </Field>
    </FieldWrapper>
  )
}
