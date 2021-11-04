import {Or} from '../../constants'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps} from 'formik'
import {FormControl} from 'baseui/form-control'
import React, {ReactNode, useState} from 'react'
import {Block} from 'baseui/block'
import Button from './Button'
import {RenderTagList} from './TagList'
import {Value} from 'baseui/select'
import {Code, codelist, ListName} from '../../services/Codelist'
import {SearchType} from '../../api/TeamApi'
import * as _ from 'lodash'
import {Datepicker} from 'baseui/datepicker'
import moment from 'moment'
import {Radio, RadioGroup} from 'baseui/radio'
import LabelWithTooltip from '../common/LabelWithTooltip'
import CustomInput from '../common/CustomizedInput'
import CustomizedSelect from '../common/CustomizedSelect'
import CustomizedTextarea from './CustomizedTextarea'
import TextEditor from './TextEditor/TextEditor'
import {Error} from "./ModalSchema";
import {ettlevColors} from "../../util/theme";
import { borderWidth } from './Style'

export const FieldWrapper = ({children, marginBottom}: { children: React.ReactNode; marginBottom?: string }) => {
  return <Block marginBottom={marginBottom ? marginBottom : '1.5rem'}>{children}</Block>
}

export const InputField = (props: { label: string; name: string; caption?: ReactNode; tooltip?: string; marginBottom?: string }) => (
  <FieldWrapper marginBottom={props.marginBottom}>
    <Field name={props.name}>
      {(p: FieldProps) => (
        <FormControl
          overrides={{Label: {style: {marginTop: '0px', marginBottom: '0px', paddingTop: '8px', paddingBottom: '8px'}}}}
          label={<LabelWithTooltip label={props.label} tooltip={props.tooltip}/>}
          caption={props.caption}
        >
          <Block>
            <CustomInput {...p.field} placeholder={props.label}
                         overrides={{
                           Input: {
                             style: {
                               backgroundColor: p.form.errors[props.name] && ettlevColors.error50,
                             }
                           },
                           Root: {
                             style: {
                               borderRightColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                               borderLeftColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                               borderTopColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                               borderBottomColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200
                             }
                           }
                         }}
            />
            <Error fieldName={props.name} fullWidth/>
          </Block>
        </FormControl>
      )}
    </Field>
  </FieldWrapper>
)

export const TextAreaField = (props: {
  height?: string
  marginBottom?: string
  label: string
  name: string
  markdown?: boolean
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
  caption?: ReactNode
  tooltip?: string
  noPlaceholder?: boolean
}) => {
  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <Field name={props.name}>
        {(p: FieldProps) => (
          <FormControl
            overrides={{
              ControlContainer: {
                style: {marginBottom: '0px'}
              },
              Caption: {style: {marginBottom: '0px'}}
            }}
            label={<LabelWithTooltip label={props.label} tooltip={props.tooltip}/>}
            caption={
              props.markdown ? (
                <Block display="flex" flexDirection={'column'}>
                  {props.caption}
                  {/* <MarkdownInfo /> */}
                </Block>
              ) : (
                props.caption
              )
            }
          >
            <>
              {props.markdown && (
                <Block>
                  <TextEditor
                    height={props.height}
                    initialValue={p.field.value}
                    setValue={(v) => p.form.setFieldValue(props.name, v)}
                    onImageUpload={props.onImageUpload}
                    shortenLinks={props.shortenLinks}
                  />
                  {/* <MarkdownEditor initialValue={p.field.value} setValue={v => p.form.setFieldValue(props.name, v)}
                onImageUpload={props.onImageUpload} shortenLinks={props.shortenLinks} /> */}
                </Block>
              )}
              {!props.markdown && <CustomizedTextarea rows={8} {...p.field} placeholder={props.noPlaceholder ? '' : props.label}/>}
            </>
          </FormControl>
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
export const BoolField = (props: { label: string; name: string; nullable?: boolean }) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) => (
        <FormControl label={props.label} error={p.meta.touched && p.meta.error}>
          <RadioGroup
            value={boolToRadio(p.field.value)}
            align="horizontal"
            overrides={{RadioGroupRoot: {style: {width: '100%', justifyContent: 'stretch'}}}}
            onChange={(e) => {
              p.form.setFieldValue(props.name, radioToBool((e.target as HTMLInputElement).value))
            }}
          >
            <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={YES}>
              Ja
            </Radio>
            <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={NO}>
              Nei
            </Radio>
            {props.nullable && (
              <Radio overrides={{Label: {style: {marginRight: '2rem'}}}} value={UNCLARIFIED}>
                Uavklart
              </Radio>
            )}
          </RadioGroup>
        </FormControl>
      )}
    </Field>
  </FieldWrapper>
)

export const DateField = (props: { label: string; name: string; caption?: ReactNode; tooltip?: string }) => (
  <FieldWrapper>
    <Field name={props.name}>
      {(p: FieldProps) => (
        <FormControl label={<LabelWithTooltip label={props.label} tooltip={props.tooltip}/>} error={p.meta.touched && p.meta.error} caption={props.caption}>
          <Datepicker
            clearable
            formatString={'dd-MM-yyyy'}
            value={p.field.value ? moment(p.field.value).toDate() : undefined}
            onChange={({date}) => {
              const dateSingle = Array.isArray(date) ? date[0] : date
              if (dateSingle) p.form.setFieldValue(props.name, dateSingle.toISOString().split('T')[0])
              else p.form.setFieldValue(props.name, undefined)
            }}
          />
        </FormControl>
      )}
    </Field>
  </FieldWrapper>
)

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
  marginBottom?: string
}) => {
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
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const add = () => {
            if (!val) return
            if (linkName) {
              p.push(`[${linkName}](${val})`)
            } else p.push(val)
            setVal('')
            setLinkName('')
          }
          const onKey = (e: React.KeyboardEvent) => e.key === 'Enter' && add()

          return (
            <FormControl
              // error={p.form.touched[props.name] && p.form.errors[props.name]}
              caption={props.caption}>
              <Block>
                <Block display="flex" width="100%" alignItems={'flex-end'}>
                  {props.link && (
                    <Block width="100%" maxWidth={props.maxInputWidth}>
                      <LabelWithTooltip label={props.linkLabel} tooltip={props.linkTooltip}/>
                      <CustomInput
                        onKeyDown={onKey}
                        value={linkName}
                        onChange={(e) => setLinkName((e.target as HTMLInputElement).value)}
                        overrides={{
                          Input: {
                            style: {
                              backgroundColor: p.form.errors[props.name] && ettlevColors.error50,
                            }
                          },
                          Root: {
                            style: {
                              borderRightColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                              borderLeftColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                              borderTopColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                              borderBottomColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200
                            }
                          }
                        }}
                      />
                    </Block>
                  )}
                  <Block marginLeft={props.link ? '12px' : '0px'} width="100%" maxWidth={!props.link ? props.maxInputWidth : undefined}>
                    <LabelWithTooltip label={props.label} tooltip={props.tooltip}/>
                    <CustomInput
                      onKeyDown={onKey}
                      value={val}
                      inputRef={inputRef}
                      onChange={(e) => setVal((e.target as HTMLInputElement).value)}
                      onBlur={!props.link ? add : undefined}
                      overrides={{
                        Input: {
                          style: {
                            backgroundColor: p.form.errors[props.name] && ettlevColors.error50 ,
                          }
                        },
                        Root: {
                          style: {
                            borderRightColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                            borderLeftColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                            borderTopColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200,
                            borderBottomColor: p.form.errors[props.name] ? ettlevColors.red600 : ettlevColors.grey200
                          }
                        }
                      }}
                    />
                  </Block>

                  <Block minWidth="107px">
                    <Button type="button" onClick={add} marginLeft label={'Legg til'} kind="secondary" size="compact">
                      Legg til
                    </Button>
                  </Block>
                </Block>
                <RenderTagList list={(p.form.values[props.name] as string[]).map(linkNameFor)} onRemove={p.remove} onClick={(i) => onClick(p, i)}/>
              </Block>
            </FormControl>
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
        {(p: FieldProps<string | Code>) => (
          <FormControl label={<LabelWithTooltip label={props.label} tooltip={props.tooltip}/>} error={p.meta.touched && p.meta.error} caption={props.caption}>
            <OptionList {...props} onChange={(val) => p.form.setFieldValue(props.name, val)} value={p.field.value}/>
          </FormControl>
        )}
      </Field>
    </FieldWrapper>
  )
}

export const OptionList = (
  props: { label: string; clearable?: boolean; value?: Code | string; onChange: (val?: any) => void } & Or<{ options: Value }, { listName: ListName }>,
) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <CustomizedSelect
      options={options}
      clearable={props.clearable}
      value={options.filter((o) => o.id === (props.listName ? (props.value as Code | undefined)?.code : props.value))}
      onChange={(s) => {
        const val = s.option?.id
        const toSet = props.listName && val ? codelist.getCode(props.listName, val as string) : val
        return props.onChange(toSet)
      }}
      placeholder={props.label}
      aria-label={props.label}
      overrides={{
        ControlContainer: {
          style:{
            ...borderWidth('2px')
          }
        }
      }}
    />
  )
}

export const MultiOptionField = (
  props: {
    label: string;
    name: string;
    caption?: ReactNode;
    tooltip?: string;
    marginBottom?: string;
  }
    & Or<{ options: Value }, { listName: ListName }>,
) => {
  const options: Value = props.options || codelist.getParsedOptions(props.listName)
  return (
    <FieldWrapper marginBottom={props.marginBottom}>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => {
          const selectedIds = (p.form.values[props.name] as any[]).map((v) => (props.listName ? (v as Code).code : v))
          return (
            <FormControl
              label={<LabelWithTooltip label={props.label} tooltip={props.tooltip}/>}
              caption={props.caption}
            >
              <Block>
                <Block display="flex">
                  <CustomizedSelect
                    placeholder={'Velg ' + _.lowerFirst(props.label)}
                    aria-label={'Velg ' + _.lowerFirst(props.label)}
                    maxDropdownHeight="400px"
                    options={options.filter((o) => selectedIds.indexOf(o.id) < 0)}
                    onChange={({value}) => {
                      value.length && p.push(props.listName ? codelist.getCode(props.listName, value[0].id as string) : value[0].id)
                    }}
                  />
                </Block>
                <RenderTagList list={selectedIds.map((v) => options.find((o) => o.id === v)?.label)} onRemove={p.remove} wide/>
              </Block>
            </FormControl>
          )
        }}
      </FieldArray>
    </FieldWrapper>
  )
}

export const MultiSearchField = (props: { label: string; name: string; search: SearchType; itemLabel?: (id: string) => React.ReactNode }) => {
  const [results, setSearch, loading] = props.search

  return (
    <FieldWrapper>
      <FieldArray name={props.name}>
        {(p: FieldArrayRenderProps) => (
          <FormControl label={props.label} error={p.form.touched[props.name] && p.form.errors[props.name]}>
            <Block>
              <Block display="flex">
                <CustomizedSelect
                  placeholder={'Søk ' + _.lowerFirst(props.label)}
                  maxDropdownHeight="400px"
                  filterOptions={(o) => o}
                  searchable
                  noResultsMsg="Ingen resultat"
                  options={results.filter((o) => (p.form.values[props.name] as any[]).indexOf(o.id) < 0)}
                  onChange={({value}) => {
                    value.length && p.push(value[0].id)
                  }}
                  onInputChange={(event) => setSearch(event.currentTarget.value)}
                  isLoading={loading}
                />
              </Block>
              <RenderTagList list={(p.form.values[props.name] as string[]).map((v) => (props.itemLabel ? props.itemLabel(v) : v))} onRemove={p.remove} wide/>
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
              value={[{id: p.field.value, label: props.itemLabel ? props.itemLabel(p.field.value) : p.field.value}]}
              onChange={({value}) => {
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
