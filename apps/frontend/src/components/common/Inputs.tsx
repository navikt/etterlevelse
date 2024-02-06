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

/* TODO USIKKER */
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
import { Error, FormError } from './ModalSchema'
import { RenderTagList } from './TagList'
import TextEditor from './TextEditor/TextEditor'

interface ILabel {
  label: string
}

interface IName {
  name: string
}

type TLabelName = IName & ILabel

interface IMarginBottom {
  marginBottom?: boolean
}

interface ICaption {
  caption?: ReactNode
}

interface ITooltip {
  tooltip?: string
}

interface IOptions {
  options: Value
}

interface IListname {
  listName: EListName
}

interface ISearchItemLabel {
  search: TSearchType
  itemLabel?: (id: string) => string
}

interface IPropsOptionList extends ILabel {
  value?: string
  onChange: (val?: any) => void
}

type TOptionORListname = TOr<IOptions, IListname>

type TLabelNameSearchItemLabel = TLabelName & ISearchItemLabel

interface IPropsFieldWrapper extends IMarginBottom {
  children: React.ReactNode
}

export const FieldWrapper = ({ children, marginBottom }: IPropsFieldWrapper) => (
  <div className={`${marginBottom ? 'mb-6' : ''}`}>{children}</div>
)

interface IPropsInputField extends TLabelName, IMarginBottom {
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
              error={p.form.errors[name] ? <FormError fieldName={name} /> : undefined}
            />
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

interface IPropsTextAreaField extends TLabelName, IMarginBottom, ICaption {
  height?: string
  markdown?: boolean
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
                error={p.form.errors[name] ? <FormError fieldName={name} /> : undefined}
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

interface IPropsBoolField extends TLabelName, ITooltip {
  nullable?: boolean
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
            <FormError fieldName={name} />
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

type TPropsDateField = IName

export const DateField = (props: TPropsDateField) => {
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

interface IPropsMultiInputField extends TLabelName, IMarginBottom, ITooltip {
  link?: boolean
  linkLabel?: string
  linkTooltip?: string
  maxInputWidth?: string
  setErrors?: () => void
  removeErrors?: () => void
}

export const MultiInputField = (props: IPropsMultiInputField) => {
  const { label, name, link, linkLabel, linkTooltip, tooltip, maxInputWidth, marginBottom } = props
  const [val, setVal] = useState<string>('')
  const [linkName, setLinkName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <FieldWrapper marginBottom={marginBottom}>
      <FieldArray name={name}>
        {(p: FieldArrayRenderProps) => {
          const add = () => {
            if (link) {
              if (linkName && val) {
                p.push(`[${linkName}](${val})`)
                setError('')
              } else if (linkName && !val) {
                p.push(linkName)
                setError('')
              } else if (!linkName && !val) {
                return
              } else {
                setError('Må ha navn på kilde')
                return
              }
            } else {
              if (val) {
                p.push(val)
              } else {
                setError('Må ha navn på kilde')
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
                      className={`${error !== '' ? 'border-2 rounded-md border-[#c30000]' : undefined}`}
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

              {error && <Error message={error} />}

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

type TPropsOptionField = TLabelName & IMarginBottom & ICaption & ITooltip & TOptionORListname

export const OptionField = (props: TPropsOptionField) => {
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

type TPropsOptionList = IPropsOptionList & TOptionORListname

export const OptionList = (props: TPropsOptionList) => {
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

type TPropsMultiSearchField = TLabelNameSearchItemLabel

export const MultiSearchField = (props: TPropsMultiSearchField) => {
  const { label, name, search, itemLabel } = props
  const [results, setSearch, loading] = search

  return (
    <FieldWrapper>
      <FieldArray name={name}>
        {(p: FieldArrayRenderProps) => (
          <FormControl label={label} error={p.form.touched[name] && <>{p.form.errors[name]}</>}>
            <div>
              <div className="flex">
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
              </div>
              <RenderTagList
                list={(p.form.values[name] as string[]).map((v) => (itemLabel ? itemLabel(v) : v))}
                onRemove={p.remove}
              />
            </div>
          </FormControl>
        )}
      </FieldArray>
    </FieldWrapper>
  )
}

type TPropsSearchField = TLabelNameSearchItemLabel

export const SearchField = (props: TPropsSearchField) => {
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
