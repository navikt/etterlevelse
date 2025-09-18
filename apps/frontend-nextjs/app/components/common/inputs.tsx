import { Error } from '@/components/common/modalSchema/ModalSchema'
import { TOption, TOr } from '@/constants/commonConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { codelist } from '@/services/kodeverk/kodeverkService'
import {
  Button,
  DatePicker,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  useDatepicker,
} from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps } from 'formik'
import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { FieldWrapper } from './fieldWrapper/fieldWrapper'
import LabelWithTooltip from './labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from './modalSchema/formError/formError'
import { RenderTagList } from './renderTagList/renderTagList'

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

interface IPropsInputField extends TLabelName, IMarginBottom {
  description?: string
  disablePlaceHolder?: boolean
}

export const InputField = (props: IPropsInputField) => {
  const { name, label, disablePlaceHolder, marginBottom, description } = props

  return (
    <FieldWrapper marginBottom={marginBottom} id={name}>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div className='w-full'>
            <TextField
              label={label}
              description={description}
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

interface IPropsBoolField extends TLabelName, ITooltip {
  nullable?: boolean
  horizontal?: boolean
}

const YES = 'YES',
  NO = 'NO',
  UNCLARIFIED = 'UNCLARIFIED'
const boolToRadio = (bool?: boolean) => {
  return bool === null || bool === undefined ? UNCLARIFIED : bool ? YES : NO
}
const radioToBool = (radio: string) => (radio === UNCLARIFIED ? undefined : radio === YES)

export const BoolField = (props: IPropsBoolField) => {
  const { label, name, nullable, tooltip, horizontal } = props

  return (
    <FieldWrapper>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div className='my-3'>
            <RadioGroup
              legend={label}
              description={tooltip}
              value={boolToRadio(fieldProps.field.value)}
              onChange={(value) => {
                fieldProps.form.setFieldValue(name, radioToBool(value))
              }}
              error={fieldProps.form.errors[name] && <FormError fieldName={name} />}
            >
              <Stack
                gap='0 6'
                direction={{ xs: horizontal ? 'column' : 'row', sm: horizontal ? 'row' : 'column' }}
                wrap={false}
              >
                <Radio value={YES}>Ja</Radio>
                <Radio value={NO}>Nei</Radio>
                {nullable && <Radio value={UNCLARIFIED}>Uavklart</Radio>}
              </Stack>
            </RadioGroup>
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}

interface IPropsDateField extends IName {
  label?: string
}

interface IBeforeMarcher {
  before: Date
}

export const DateField = (props: IPropsDateField) => {
  const { name, label } = props

  const { datepickerProps, inputProps } = useDatepicker({})
  const [open, setOpen] = useState(false)
  const [beforeMatcher, setBeforeMatcher] = useState<IBeforeMarcher>()
  const datePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBeforeMatcher({ before: new Date() })
  }, [])

  return (
    <div ref={datePickerRef}>
      {beforeMatcher && (
        <FieldWrapper>
          <Field name={name}>
            {(fieldProps: FieldProps) => (
              <DatePicker
                {...datepickerProps}
                open={open}
                onOpenToggle={() => {
                  datePickerRef.current?.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                  })
                  setOpen(true)
                }}
                onClose={() => setOpen(false)}
                onSelect={(date: any) => {
                  const dateSingle: Date = Array.isArray(date) ? date[0] : date
                  if (dateSingle) {
                    const year = dateSingle.getFullYear()
                    const month = dateSingle.getMonth() + 1
                    const day = dateSingle.getDate()
                    const date = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
                    fieldProps.form.setFieldValue(name, date)
                  } else fieldProps.form.setFieldValue(name, undefined)
                  setOpen(false)
                }}
                disabled={[beforeMatcher]}
              >
                <DatePicker.Input
                  {...inputProps}
                  className='mb-2'
                  value={fieldProps.form.values[name]}
                  label={label ? label : 'Velg dato'}
                />
              </DatePicker>
            )}
          </Field>
        </FieldWrapper>
      )}
    </div>
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
              <div className='flex w-full items-end'>
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

                <div className='min-w-[6.688rem] ml-2.5'>
                  <Button type='button' onClick={() => add()} variant='secondary'>
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
      className='w-full'
      value={value}
      error={error}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => {
        const val: string = event.target.value
        const toSet: string | ICode =
          listName && val ? (codelist.getCode(listName, val) as ICode) : val
        return onChange(toSet)
      }}
    >
      <option value=''></option>
      {optionsList.map(
        (
          code: Readonly<{
            value?: string | number
            label?: ReactNode
          }>,
          index: number
        ) => (
          <option key={index + '_' + code.label} value={code.value}>
            {code.label}
          </option>
        )
      )}
    </Select>
  )
}
