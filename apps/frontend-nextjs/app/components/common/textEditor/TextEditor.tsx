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
import { FormikErrors } from 'formik'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import { useEffect, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg-next'
import 'react-draft-wysiwyg-next/dist/react-draft-wysiwyg.css'
import { FormError } from '../modalSchema/formError/formError'
import './customStyle.css'

type TTextEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  height?: string
  errors?: FormikErrors<any>
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
        'bgcolor-rgb(252, 221, 205)': {
          open: () => {
            return `<span style='background-color: rgb(252, 221, 205)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        'bgcolor-rgb(255, 217, 230)': {
          open: () => {
            return `<span style='background-color: rgb(255, 217, 230)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        'bgcolor-rgb(235, 222, 252)': {
          open: () => {
            return `<span style='background-color: rgb(235, 222, 252)'>`
          },
          close: () => {
            return '</span>'
          },
        },
        'bgcolor-rgb(215, 215, 215)': {
          open: () => {
            return `<span style='background-color: rgb(215, 215, 215)'>`
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

  const hasError = errors && name && errors[name]

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
                'rgb(252, 221, 205)',
                'rgb(255, 217, 230)',
                'rgb(235, 222, 252)',
                'rgb(215, 215, 215)',
                'rgb(255, 255, 255)',
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
