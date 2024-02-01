import {
  Button,
  DatePicker,
  Detail,
  Label,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Textarea,
  useDatepicker,
} from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { Value } from 'baseui/select'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import * as _ from 'lodash'
import React, { ReactNode, useState } from 'react'
import { TSearchType } from '../../api/TeamApi'
import { TOr } from '../../constants'
import { EListName, codelist } from '../../services/Codelist'
import CustomizedSelect from '../common/CustomizedSelect'
import LabelWithTooltip from '../common/LabelWithTooltip'
import { MarkdownInfo } from './Markdown'
import { Error } from './ModalSchema'
import { RenderTagList } from './TagList'
import TextEditor from './TextEditor/TextEditor'

interface IPropsFieldWrapper {
  children: React.ReactNode
  marginBottom?: boolean
}

export const FieldWrapper = ({ children, marginBottom }: IPropsFieldWrapper) => (
  <div className={`${marginBottom ? 'mb-6' : ''}`}>{children}</div>
)

interface IPropsInputField {
  label: string
  name: string
  marginBottom?: boolean
  disablePlaceHolder?: boolean
}

export const InputField = (props: IPropsInputField) => {
  const { name, label, disablePlaceHolder, marginBottom } = props

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <Field name={name}>
        {(p: FieldProps) => (
          <div className="w-full">
            <TextField
              label={label}
              {...p.field}
              placeholder={!disablePlaceHolder ? label : undefined}
              error={p.form.errors[name] ? <Error fieldName={name} /> : undefined}
            />
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

interface IPropsTextAreaField {
  height?: string
  marginBottom?: boolean
  label: string
  name: string
  markdown?: boolean
  caption?: ReactNode
  noPlaceholder?: boolean
  placeholder?: string
  maxCharacter?: number
  rows?: number
  setIsFormDirty?: (v: boolean) => void
}

export const TextAreaField = (props: IPropsTextAreaField) => {
  const {
    height,
    marginBottom,
    label,
    name,
    markdown,
    caption,
    noPlaceholder,
    placeholder,
    maxCharacter,
    rows,
    setIsFormDirty,
  } = props

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <Field name={name}>
        {(p: FieldProps) => (
          <div>
            {markdown && (
              <div>
                <Label>{label}</Label>
                <Detail>{caption}</Detail>
                <MarkdownInfo />
                <TextEditor
                  height={height}
                  initialValue={p.field.value}
                  setValue={(v) => p.form.setFieldValue(name, v)}
                  errors={p.form.errors}
                  name={name}
                  setIsFormDirty={setIsFormDirty}
                />
                {/* <MarkdownEditor initialValue={p.field.value} setValue={v => p.form.setFieldValue(name, v)}
                onImageUpload={onImageUpload} shortenLinks={shortenLinks} /> */}
              </div>
            )}
            {!markdown && (
              <Textarea
                minRows={rows ? rows : 8}
                label={label}
                maxLength={maxCharacter ? maxCharacter : undefined}
                {...p.field}
                placeholder={noPlaceholder ? '' : placeholder ? placeholder : label}
                onChange={(v) => {
                  if (setIsFormDirty) {
                    setIsFormDirty(true)
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

interface IPropsBoolField {
  label: string
  name: string
  nullable?: boolean
  tooltip?: string
}

const YES = 'YES',
  NO = 'NO',
  UNCLARIFIED = 'UNCLARIFIED'
const boolToRadio = (bool?: boolean) => (bool === undefined ? UNCLARIFIED : bool ? YES : NO)
const radioToBool = (radio: string) => (radio === UNCLARIFIED ? undefined : radio === YES)

export const BoolField = (props: IPropsBoolField) => {
  const { label, name, nullable, tooltip } = props

  return (
    <FieldWrapper>
      <Field name={name}>
        {(p: FieldProps) => (
          <div>
            <RadioGroup
              legend={label}
              description={tooltip}
              value={boolToRadio(p.field.value)}
              onChange={(value) => {
                p.form.setFieldValue(name, radioToBool(value))
              }}
            >
              <Radio value={YES}>Ja</Radio>
              <Radio value={NO}>Nei</Radio>
              {nullable && <Radio value={UNCLARIFIED}>Uavklart</Radio>}
            </RadioGroup>
            <Error fieldName={name} />
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

interface IPropsDateField {
  name: string
}

export const DateField = (props: IPropsDateField) => {
  const { name } = props

  const { datepickerProps, inputProps } = useDatepicker({})

  return (
    <FieldWrapper>
      <Field name={name}>
        {(p: FieldProps) => (
          <DatePicker
            {...datepickerProps}
            onSelect={(date: any) => {
              const dateSingle: Date = Array.isArray(date) ? date[0] : date
              if (dateSingle) {
                const newDate = dateSingle.setDate(dateSingle.getDate() + 1)
                const formatedDate = new Date(newDate)
                p.form.setFieldValue(name, formatedDate.toISOString().split('T')[0])
              } else p.form.setFieldValue(name, undefined)
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

interface IPropsMultiInputField {
  label: string
  name: string
  link?: boolean
  linkLabel?: string
  linkTooltip?: string
  tooltip?: string
  maxInputWidth?: string
  marginBottom?: boolean
  setErrors?: () => void
}

export const MultiInputField = (props: IPropsMultiInputField) => {
  const {
    label,
    name,
    link,
    linkLabel,
    linkTooltip,
    tooltip,
    maxInputWidth,
    marginBottom,
    setErrors,
  } = props
  const [val, setVal] = useState('')
  const [linkName, setLinkName] = useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <FieldArray name={name}>
        {(p: FieldArrayRenderProps) => {
          const add = () => {
            if (link) {
              if (linkName && val) {
                p.push(`[${linkName}](${val})`)
              } else if (linkName && !val) {
                p.push(linkName)
              } else if (!linkName && !val) {
                return
              } else {
                setErrors && setErrors()
                return
              }
            } else {
              if (val) {
                p.push(val)
              } else {
                setErrors && setErrors()
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
                {link && (
                  <div
                    className={`w-full ${
                      maxInputWidth ? 'max-w-[' + maxInputWidth + ']' : undefined
                    }`}
                  >
                    <LabelWithTooltip label={linkLabel} tooltip={linkTooltip} />
                    <TextField
                      label={label}
                      hideLabel
                      onKeyDown={onKey}
                      value={linkName}
                      onChange={(e) => setLinkName((e.target as HTMLInputElement).value)}
                    />
                  </div>
                )}
                <div
                  className={`w-full ${link ? 'ml-3' : undefined} ${
                    !link ? 'max-w-[' + maxInputWidth + ']' : undefined
                  }`}
                >
                  <LabelWithTooltip label={label} tooltip={tooltip} />
                  <TextField
                    label={label}
                    hideLabel
                    onKeyDown={onKey}
                    value={val}
                    ref={inputRef}
                    onChange={(e) => setVal((e.target as HTMLInputElement).value)}
                    onBlur={!link ? add : undefined}
                  />
                </div>

                <div className="min-w-[107px] ml-2.5">
                  <Button type="button" onClick={() => add()} variant="secondary">
                    Legg til
                  </Button>
                </div>
              </div>
              <RenderTagList
                list={(p.form.values[name] as string[]).map(linkNameFor)}
                onRemove={p.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

interface IPropsOptionField {
  label: string
  name: string
  caption?: ReactNode
  tooltip?: string
}

export const OptionField = (
  props: IPropsOptionField & TOr<{ options: Value }, { listName: EListName }>
) => {
  const { label, name, caption, tooltip } = props

  return (
    <FieldWrapper>
      <Field name={name}>
        {(p: FieldProps<string>) => (
          <FormControl
            label={<LabelWithTooltip label={label} tooltip={tooltip} />}
            error={p.meta.touched && p.meta.error}
            caption={caption}
          >
            <OptionList
              {...props}
              onChange={(val) => p.form.setFieldValue(name, val)}
              value={p.field.value}
            />
          </FormControl>
        )}
      </Field>
    </FieldWrapper>
  )
}

interface IPropsOptionList {
  label: string
  value?: string
  onChange: (val?: any) => void
}

export const OptionList = (
  props: IPropsOptionList & TOr<{ options: Value }, { listName: EListName }>
) => {
  const { label, value, onChange, options, listName } = props
  const optionsList: Value = options || codelist.getParsedOptions(listName)

  return (
    <Select
      label={label}
      hideLabel
      className="w-full"
      value={value}
      onChange={(e) => {
        const val = e.target.value
        const toSet = listName && val ? codelist.getCode(listName, val) : val
        return onChange(toSet)
      }}
    >
      <option value="">Velg {label}</option>
      {optionsList.map((c, i) => (
        <option key={i + '_' + c.label} value={c.id}>
          {c.label}
        </option>
      ))}
    </Select>
  )
}

interface IPropsMultiSearchField {
  label: string
  name: string
  search: TSearchType
  itemLabel?: (id: string) => string
}

export const MultiSearchField = (props: IPropsMultiSearchField) => {
  const { label, name, search, itemLabel } = props
  const [results, setSearch, loading] = search

  return (
    <FieldWrapper>
      <FieldArray name={name}>
        {(p: FieldArrayRenderProps) => (
          <FormControl label={label} error={p.form.touched[name] && <>{p.form.errors[name]}</>}>
            <Block>
              <Block display="flex">
                <CustomizedSelect
                  placeholder={'Søk ' + _.lowerFirst(label)}
                  maxDropdownHeight="400px"
                  filterOptions={(o) => o}
                  searchable
                  noResultsMsg="Ingen resultat"
                  options={results.filter((o) => (p.form.values[name] as any[]).indexOf(o.id) < 0)}
                  onChange={({ value }) => {
                    value.length && p.push(value[0].id)
                  }}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  isLoading={loading}
                />
              </Block>
              <RenderTagList
                list={(p.form.values[name] as string[]).map((v) => (itemLabel ? itemLabel(v) : v))}
                onRemove={p.remove}
              />
            </Block>
          </FormControl>
        )}
      </FieldArray>
    </FieldWrapper>
  )
}

interface IPropsSearchField {
  label: string
  name: string
  search: TSearchType
  itemLabel?: (id: string) => string
}

export const SearchField = (props: IPropsSearchField) => {
  const { label, name, search, itemLabel } = props
  const [results, setSearch, loading] = search

  return (
    <FieldWrapper>
      <Field name={name}>
        {(p: FieldProps<string>) => (
          <FormControl label={label} error={p.meta.touched && p.meta.error}>
            <CustomizedSelect
              placeholder={'Søk ' + _.lowerFirst(label)}
              maxDropdownHeight="400px"
              filterOptions={(option) => option}
              searchable
              noResultsMsg="Ingen resultat"
              options={results}
              value={[
                {
                  id: p.field.value,
                  label: itemLabel ? itemLabel(p.field.value) : p.field.value,
                },
              ]}
              onChange={({ value }) => {
                p.form.setFieldValue(name, value.length ? (value[0].id as string) : '')
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
