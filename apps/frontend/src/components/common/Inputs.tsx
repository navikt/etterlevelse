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
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import React, { ReactNode, useState } from 'react'
import { TOption, TOr } from '../../constants'
import { EListName, ICode, codelist } from '../../services/Codelist'
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

interface IID {
  id?: string
}

interface ICaption {
  caption?: ReactNode
}

interface ITooltip {
  tooltip?: string
}

interface IOptions {
  options: TOption[]
}

interface IListname {
  listName: EListName
}

interface IPropsOptionList extends ILabel {
  value?: string
  onChange: (val?: any) => void
  error?: string | ReactNode
}

type TOptionORListname = TOr<IOptions, IListname>

interface IPropsFieldWrapper extends IMarginBottom, IID {
  children: React.ReactNode
}

export const FieldWrapper = ({ children, marginBottom, id }: IPropsFieldWrapper) => (
  <div className={`${marginBottom ? 'mb-6' : ''}`} id={id}>
    {children}
  </div>
)

interface IPropsInputField extends TLabelName, IMarginBottom {
  disablePlaceHolder?: boolean
}

export const InputField = (props: IPropsInputField) => {
  const { name, label, disablePlaceHolder, marginBottom } = props

  return (
    <FieldWrapper marginBottom={marginBottom} id={name}>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div className="w-full">
            <TextField
              label={label}
              {...fieldProps.field}
              placeholder={!disablePlaceHolder ? label : undefined}
              error={fieldProps.form.errors[name] ? <FormError fieldName={name} /> : undefined}
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
    <FieldWrapper marginBottom={marginBottom} id={name}>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div>
            {markdown && (
              <div>
                <Label>{label}</Label>
                <Detail>{caption}</Detail>
                <MarkdownInfo />
                <TextEditor
                  height={height}
                  initialValue={fieldProps.field.value}
                  setValue={(v) => fieldProps.form.setFieldValue(name, v)}
                  errors={fieldProps.form.errors}
                  name={name}
                  setIsFormDirty={setIsFormDirty}
                />
              </div>
            )}
            {!markdown && (
              <Textarea
                minRows={rows ? rows : 8}
                label={label}
                maxLength={maxCharacter ? maxCharacter : undefined}
                error={fieldProps.form.errors[name] ? <FormError fieldName={name} /> : undefined}
                {...fieldProps.field}
                placeholder={noPlaceholder ? '' : placeholder ? placeholder : label}
                onChange={(v) => {
                  if (setIsFormDirty) {
                    setIsFormDirty(true)
                  }
                  fieldProps.field.onChange(v)
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
        {(fieldProps: FieldProps) => (
          <div>
            <RadioGroup
              legend={label}
              description={tooltip}
              value={boolToRadio(fieldProps.field.value)}
              onChange={(value) => {
                fieldProps.form.setFieldValue(name, radioToBool(value))
              }}
              error={fieldProps.form.errors[name] && <FormError fieldName={name} />}
            >
              <Radio value={YES}>Ja</Radio>
              <Radio value={NO}>Nei</Radio>
              {nullable && <Radio value={UNCLARIFIED}>Uavklart</Radio>}
            </RadioGroup>
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
        {(fieldProps: FieldProps) => (
          <DatePicker
            {...datepickerProps}
            onSelect={(date: any) => {
              const dateSingle: Date = Array.isArray(date) ? date[0] : date
              if (dateSingle) {
                const newDate = dateSingle.setDate(dateSingle.getDate() + 1)
                const formatedDate = new Date(newDate)
                fieldProps.form.setFieldValue(name, formatedDate.toISOString().split('T')[0])
              } else fieldProps.form.setFieldValue(name, undefined)
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
        {(fieldArrayRenderProps: FieldArrayRenderProps) => {
          const add = () => {
            if (link) {
              if (linkName && val) {
                fieldArrayRenderProps.push(`[${linkName}](${val})`)
                setError('')
              } else if (linkName && !val) {
                fieldArrayRenderProps.push(linkName)
                setError('')
              } else if (!linkName && !val) {
                return
              } else {
                setError('Må ha navn på kilde')
                return
              }
            } else {
              if (val) {
                fieldArrayRenderProps.push(val)
              } else {
                setError('Må ha navn på kilde')
                return
              }
            }
            setVal('')
            setLinkName('')
          }
          const onKey = (event: React.KeyboardEvent) => event.key === 'Enter' && add()

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

                <div className="min-w-[6.688rem] ml-2.5">
                  <Button type="button" onClick={() => add()} variant="secondary">
                    Legg til
                  </Button>
                </div>
              </div>

              {error && <Error message={error} />}

              <RenderTagList
                list={(fieldArrayRenderProps.form.values[name] as string[]).map(linkNameFor)}
                onRemove={fieldArrayRenderProps.remove}
              />
            </div>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

type TPropsOptionList = IPropsOptionList & TOptionORListname

export const OptionList = (props: TPropsOptionList) => {
  const { label, value, onChange, options, listName, error } = props
  const optionsList: TOption[] = options || codelist.getParsedOptions(listName)

  return (
    <Select
      label={label}
      hideLabel
      className="w-full"
      value={value}
      error={error}
      onChange={async (event) => {
        const val = event.target.value
        const toSet = listName && val ? ((await codelist.getCode(listName, val)) as ICode) : val
        return onChange(toSet)
      }}
    >
      <option value="">Velg {label}</option>
      {optionsList.map((code, index) => (
        <option key={index + '_' + code.label} value={code.value}>
          {code.label}
        </option>
      ))}
    </Select>
  )
}
