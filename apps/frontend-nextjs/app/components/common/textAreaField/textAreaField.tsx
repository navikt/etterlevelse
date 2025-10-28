'use client'

import { BodyShort, Label, Textarea, ToggleGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { ChangeEvent, ReactNode, useState } from 'react'
import { FieldWrapper } from '../fieldWrapper/fieldWrapper'
import { Markdown } from '../markdown/markdown'
import { FormError } from '../modalSchema/formError/formError'
import TextEditor from '../textEditor/TextEditor'

interface ILabel {
  label: string
}

interface IName {
  name: string
}

interface IMarginBottom {
  marginBottom?: boolean
}

interface ICaption {
  caption?: ReactNode
}

type TLabelName = IName & ILabel

interface IPropsTextAreaField extends TLabelName, IMarginBottom, ICaption {
  height?: string
  markdown?: boolean
  noPlaceholder?: boolean
  placeholder?: string
  maxCharacter?: number
  rows?: number
  withHighlight?: boolean
  withUnderline?: boolean
}

export const TextAreaField = ({
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
  withHighlight,
  withUnderline,
}: IPropsTextAreaField) => {
  const [mode, setMode] = useState('edit')

  return (
    <FieldWrapper marginBottom={marginBottom} id={name}>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div>
            {markdown && (
              <div>
                <div className='flex w-full justify-between mb-1'>
                  <div>
                    <Label>{label}</Label>
                    <BodyShort className='text-(--a-text-subtle)'>{caption}</BodyShort>
                  </div>
                </div>
                {mode === 'edit' && (
                  <TextEditor
                    height={height}
                    initialValue={fieldProps.field.value}
                    setValue={(v: string) => fieldProps.form.setFieldValue(name, v)}
                    errors={fieldProps.form.errors}
                    name={name}
                    withHighlight={withHighlight}
                    withUnderline={withUnderline}
                  />
                )}

                {mode === 'view' && (
                  <div className='p-8 border-border-subtle-hover border border-solid rounded-md'>
                    <Markdown source={fieldProps.field.value} escapeHtml={false} />
                  </div>
                )}
                <div className='flex flex-col items-end justify-end -mt-px'>
                  <ToggleGroup defaultValue='edit' onChange={setMode} size='small'>
                    <ToggleGroup.Item value='edit'>Redigering</ToggleGroup.Item>
                    <ToggleGroup.Item value='view'>Forhåndsvisning</ToggleGroup.Item>
                  </ToggleGroup>
                </div>
              </div>
            )}
            {!markdown && (
              <Textarea
                minRows={rows ? rows : 8}
                label={label}
                description={caption}
                maxLength={maxCharacter ? maxCharacter : undefined}
                error={fieldProps.form.errors[name] ? <FormError fieldName={name} /> : undefined}
                {...fieldProps.field}
                placeholder={noPlaceholder ? '' : placeholder ? placeholder : label}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                  fieldProps.field.onChange(event)
                }}
              />
            )}
          </div>
        )}
      </Field>
    </FieldWrapper>
  )
}
