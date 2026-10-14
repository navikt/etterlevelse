'use client'

import { BodyShort, Label, Textarea, ToggleGroup } from '@navikt/ds-react'
import { Field, FieldProps } from 'formik'
import { CSSProperties, ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { FieldWrapper } from '../fieldWrapper/fieldWrapper'
import { Markdown } from '../markdown/markdown'
import { FormError } from '../modalSchema/formError/formError'
import TextEditor from '../textEditor/TextEditor'

interface IPropsTextAreaField {
  label: string
  name: string

  height?: string
  markdown?: boolean
  noPlaceholder?: boolean
  placeholder?: string
  maxCharacter?: number
  rows?: number
  withHighlight?: boolean
  withUnderline?: boolean
  withTextColor?: boolean
  marginBottom?: boolean
  caption?: ReactNode
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
  withTextColor,
}: IPropsTextAreaField) => {
  const [mode, setMode] = useState('edit')
  const labelRef = useRef<HTMLDivElement>(null)
  const [labelHeight, setLabelHeight] = useState(0)

  useEffect(() => {
    const element = labelRef.current
    if (!element) {
      return
    }
    const update = () => setLabelHeight(element.offsetHeight)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <FieldWrapper marginBottom={marginBottom} id={name}>
      <Field name={name}>
        {(fieldProps: FieldProps) => (
          <div>
            {markdown && (
              <div style={{ '--pvo-label-h': `${labelHeight}px` } as CSSProperties}>
                <div ref={labelRef} className='pvo-sticky-label flex w-full justify-between mb-1'>
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
                    getFieldMeta={fieldProps.form.getFieldMeta}
                    name={name}
                    withHighlight={withHighlight}
                    withUnderline={withUnderline}
                    withTextColor={withTextColor}
                  />
                )}

                {mode === 'view' && (
                  <div className='p-8 border-border-subtle-hover border border-solid rounded-md'>
                    <Markdown source={fieldProps.field.value} />
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
