'use client'

import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import { borderColor, borderRadius, borderStyle, borderWidth } from '@/util/style/Style'
import { htmlToMarkdown, markdownToHtml } from '@/util/textEditor/textEditorMarkdown'
import { ettlevColors } from '@/util/theme/theme'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FieldMetaProps, FormikErrors } from 'formik'
import { useState } from 'react'
import { FormError } from '../modalSchema/formError/formError'
import { Toolbar } from './Toolbar'
import './customStyle.css'
import { BackgroundColor, TextColor, Underline } from './extensions'

type TTextEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  height?: string
  errors?: FormikErrors<any>
  getFieldMeta?: <Value>(name: string) => FieldMetaProps<Value>
  name?: string
  simple?: boolean
  width?: string
  maxWidth?: string
  withHighlight?: boolean
  withUnderline?: boolean
  withTextColor?: boolean
}

export const TextEditor = ({
  initialValue,
  setValue,
  height,
  errors,
  getFieldMeta,
  name,
  simple,
  width,
  maxWidth,
  withHighlight,
  withUnderline,
  withTextColor,
}: TTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [val, setVal] = useDebouncedState(initialValue, 500, setValue)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5, 6] },
        link: false,
        underline: false,
      }),
      Underline,
      BackgroundColor,
      TextColor,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Image,
    ],
    content: markdownToHtml(val),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setVal(htmlToMarkdown(editor.getHTML()))
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': '',
        class: 'rdw-editor-main',
        style: `padding: 0.625rem; min-height: ${height || '31.25rem'};`,
      },
    },
  })

  const hasError = errors && name && getFieldMeta && getFieldMeta(name).error

  return (
    <div>
      <div
        className='focus:border-(--a-deepblue-600)'
        style={{
          backgroundColor: ettlevColors.white,
          ...borderColor(hasError ? ettlevColors.red500 : ettlevColors.textAreaBorder),
          ...borderWidth(hasError ? '0.125rem' : '0.063rem'),
          ...borderStyle('solid'),
          ...borderRadius('0.25rem'),
          outline: isFocused ? `0.2rem solid ${ettlevColors.focusOutline} ` : undefined,
          width: width || undefined,
          maxWidth: maxWidth || undefined,
        }}
      >
        {editor && (
          <Toolbar
            editor={editor}
            simple={simple}
            withHighlight={withHighlight}
            withUnderline={withUnderline}
            withTextColor={withTextColor}
          />
        )}
        <EditorContent editor={editor} tabIndex={0} />
      </div>
      {errors && name && errors[name] && <FormError fieldName={name as string} akselStyling />}
    </div>
  )
}

export default TextEditor
