'use client'

import { useDebouncedState } from '@/util/hooks/customHooks/customHooks'
import { borderColor, borderRadius, borderStyle, borderWidth } from '@/util/style/Style'
import {
  editorTranslations,
  joinDraftDataWithDraftWithHightligthsAndUnderline,
  translateUnderlineAndHighlight,
} from '@/util/textEditor/textEditorUtil'
import { ettlevColors } from '@/util/theme/theme'
import { RawDraftContentState, convertToRaw } from 'draft-js'
import { FieldMetaProps, FormikErrors } from 'formik'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import 'react-draft-wysiwyg-next/dist/react-draft-wysiwyg.css'
import { FormError } from '../modalSchema/formError/formError'
import './customStyle.css'

const Editor = dynamic(() => import('react-draft-wysiwyg-next').then((mod) => mod.Editor), {
  ssr: false,
})

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
}: TTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [val, setVal] = useDebouncedState(initialValue, 500, setValue)

  const CustomDraftToMarkdown = (data: RawDraftContentState) => {
    return draftToMarkdown(data, {
      entityItems: {
        IMAGE: {
          open: () => {
            return ''
          },
          close: (entity: any) => {
            return `![${entity.data.alt}](${entity.data.src})`
          },
        },
      },
      styleItems: {
        code: {
          open: () => {
            return '```\n'
          },
          close: () => {
            return '\n```'
          },
        },
        // gul = FFF83B
        'bgcolor-rgb(255, 248, 59)': {
          open: () => {
            return `<span style='background-color: rgb(255, 248, 59)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // turkis = 7FF2FF
        'bgcolor-rgb(127, 242, 255)': {
          open: () => {
            return `<span style='background-color: rgb(127, 242, 255)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // grønn = 9DFF3B
        'bgcolor-rgb(157, 255, 59)': {
          open: () => {
            return `<span style='background-color: rgb(157, 255, 59)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // rosa = FFAFEB
        'bgcolor-rgb(255, 175, 235)': {
          open: () => {
            return `<span style='background-color: rgb(255, 175, 235)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // hvit for å kunne fjerne farge
        'bgcolor-rgb(255, 255, 255)': {
          open: () => {
            return `<span style='background-color: rgb(255, 255, 255)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // oransje = FFC074
        'bgcolor-rgb(255, 192, 116)': {
          open: () => {
            return `<span style='background-color: rgb(255, 192, 116)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        // mørkelilla = C8CAFF
        'bgcolor-rgb(200, 202, 255)': {
          open: () => {
            return `<span style='background-color: rgb(200, 202, 255)'>`
          },
          close: () => {
            return '</span>'
          },
        },

        UNDERLINE: {
          open: () => {
            return `<ins>`
          },
          close: () => {
            return '</ins>'
          },
        },
      },
      preserveNewlines: true,
    })
  }

  const markdownToDraftWithPresets = (data: string) =>
    markdownToDraft(data, {
      blockEntities: {
        image: (item: any) => {
          return {
            type: 'IMAGE',
            mutability: 'MUTABLE',
            data: {
              src: item.src,
              alt: item.alt,
            },
          }
        },
      },
      preserveNewlines: true,
    })

  const CustomMarkdownToDraft = (data: string) => {
    const rawData = data
    const noUnderlineAndHighlightData = rawData
      .replaceAll(/<span style='background-color: rgb(.*?)'>/g, '')
      .replaceAll('</span>', '')
      .replaceAll('<ins>', '')
      .replaceAll('</ins>', '')
    const draftData = markdownToDraftWithPresets(noUnderlineAndHighlightData)
    const drafDataWithUnderlineAndHighligth = markdownToDraftWithPresets(rawData)
    translateUnderlineAndHighlight(drafDataWithUnderlineAndHighligth)
    joinDraftDataWithDraftWithHightligthsAndUnderline(draftData, drafDataWithUnderlineAndHighligth)
    return draftData
  }

  useEffect(() => {
    //--------ADD nessesary roles to toolbar options and editor------------
    const editorToolbar = document.getElementsByClassName('rdw-editor-toolbar')

    for (let i = 0; i < editorToolbar.length; i++) {
      editorToolbar[i].setAttribute('role', 'toolbar')
    }

    const editorTextArea = document.getElementsByClassName('rdw-editor-wrapper')

    for (let i = 0; i < editorTextArea.length; i++) {
      editorTextArea[i].setAttribute('aria-label', '')
    }

    const toolbarOptionWrapper = document.getElementsByClassName('rdw-option-wrapper')

    for (let i = 0; i < toolbarOptionWrapper.length; i++) {
      toolbarOptionWrapper[i].setAttribute('role', 'option')
    }

    const toolbarInlineWrapper = document.getElementsByClassName('rdw-inline-wrapper')

    for (let i = 0; i < toolbarInlineWrapper.length; i++) {
      toolbarInlineWrapper[i].setAttribute('role', 'listbox')
    }

    const toolbarListWrapper = document.getElementsByClassName('rdw-list-wrapper')

    for (let i = 0; i < toolbarListWrapper.length; i++) {
      toolbarListWrapper[i].setAttribute('role', 'listbox')
    }

    const toolbarLinkWrapper = document.getElementsByClassName('rdw-link-wrapper')

    for (let i = 0; i < toolbarLinkWrapper.length; i++) {
      toolbarLinkWrapper[i].setAttribute('role', 'listbox')
    }
    //--------------------------
  }, [])

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
        <Editor
          editorStyle={{
            padding: '0.625rem',
            minHeight: height || '31.25rem',
            zIndex: '0',
            position: 'relative',
          }}
          toolbarStyle={{
            backgroundColor: ettlevColors.white,
            borderBottom: `0.063rem solid ${ettlevColors.textAreaBorder}`,
          }}
          onEditorStateChange={(data) => {
            setVal(CustomDraftToMarkdown(convertToRaw(data.getCurrentContent())))
          }}
          initialContentState={CustomMarkdownToDraft(val)}
          localization={{
            translations: editorTranslations,
          }}
          onFocus={() => {
            setIsFocused(true)
          }}
          onBlur={() => {
            setIsFocused(false)
          }}
          tabIndex={0}
          toolbar={{
            options: simple
              ? ['inline', 'list', 'link']
              : withHighlight
                ? ['inline', 'blockType', 'list', 'link', 'history', 'colorPicker']
                : ['inline', 'blockType', 'list', 'link', 'history'],
            blockType: {},
            inline: {
              options: withUnderline ? ['bold', 'italic', 'underline'] : ['bold', 'italic'],
            },
            // old toolbar
            // inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
            list: { options: ['unordered', 'ordered'] },
            link: {
              defaultTargetOption: '_blank',
              options: ['link'],
            },
            colorPicker: {
              colors: [
                // gul = FFF83B
                'rgb(255, 248, 59)',
                // turkis = 7FF2FF
                'rgb(127, 242, 255)',
                // grønn = 9DFF3B
                'rgb(157, 255, 59)',
                // rosa = FFAFEB
                'rgb(255, 175, 235)',
                // hvit for å kunne fjerne farge
                'rgb(255, 255, 255)',
                // oransje = FFC074
                'rgb(255, 192, 116)',
                // mørkelilla = C8CAFF
                'rgb(200, 202, 255)',
              ],
            },
            //image: { alt: { present: true, mandatory: true }, },
          }}
        />
      </div>
      {errors && name && errors[name] && <FormError fieldName={name as string} akselStyling />}
    </div>
  )
}

export default TextEditor
