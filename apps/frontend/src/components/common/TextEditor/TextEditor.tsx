import { RawDraftContentState, convertToRaw } from 'draft-js'
import { FormikErrors } from 'formik'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import { useEffect, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useDebouncedState } from '../../../util/hooks/customHooks'
import { ettlevColors } from '../../../util/theme'
import { FormError } from '../ModalSchema'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../Style'
import './customStyle.css'
import {
  joinDraftDataWithDraftWithHightligthsAndUnderline,
  translateUnderlineAndHighlight,
} from './utils'

type TTextEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  height?: string
  errors?: FormikErrors<any>
  name?: string
  simple?: boolean
  width?: string
  maxWidth?: string
  setIsFormDirty?: (v: boolean) => void
  commentField?: boolean
}

export const TextEditor = (props: TTextEditorProps) => {
  const {
    initialValue,
    setValue,
    height,
    errors,
    name,
    simple,
    width,
    maxWidth,
    setIsFormDirty,
    commentField,
  } = props
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
        className='focus:border-[var(--a-deepblue-600)]'
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
            if (setIsFormDirty) {
              setIsFormDirty(true)
            }
          }}
          initialContentState={CustomMarkdownToDraft(val)}
          localization={{
            translations: translations,
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
              : commentField
                ? ['inline', 'blockType', 'list', 'link', 'history', 'colorPicker']
                : ['inline', 'blockType', 'list', 'link', 'history'],
            blockType: {},
            inline: {
              options: commentField
                ? ['bold', 'italic', 'underline', 'strikethrough']
                : ['bold', 'italic'],
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

const translations = {
  // Generic
  'generic.add': 'Legg Til',
  'generic.cancel': 'Avbryt',

  // BlockType
  'components.controls.blocktype.h2': 'H2',
  'components.controls.blocktype.h3': 'H3',
  'components.controls.blocktype.h4': 'H4',
  'components.controls.blocktype.h5': 'H5',
  'components.controls.blocktype.h6': 'H6',
  'components.controls.blocktype.blockquote': 'Blockquote',
  'components.controls.blocktype.code': 'Code',
  'components.controls.blocktype.blocktype': 'Block Type',
  'components.controls.blocktype.normal': 'Normal',

  // History
  'components.controls.history.history': 'History',
  'components.controls.history.undo': 'Undo',
  'components.controls.history.redo': 'Redo',

  //colorPicker
  'components.controls.colorpicker.colorpicker': 'Color Picker',
  'components.controls.colorpicker.text': 'Text',
  'components.controls.colorpicker.background': 'Highlight',

  // Inline
  'components.controls.inline.bold': 'Bold',
  'components.controls.inline.italic': 'Italic',
  'components.controls.inline.underline': 'Underline',
  'components.controls.inline.strikethrough': 'Strikethrough',
  'components.controls.inline.monospace': 'Monospace',

  // Link
  'components.controls.link.linkTitle': 'Link Tittel',
  'components.controls.link.linkTarget': 'Link Url',
  'components.controls.link.linkTargetOption': 'Åpne link i en ny fane',
  'components.controls.link.link': 'Link',
  'components.controls.link.unlink': 'Unlink',

  // List
  'components.controls.list.list': 'List',
  'components.controls.list.unordered': 'Unordered',
  'components.controls.list.ordered': 'Ordered',
  'components.controls.list.indent': 'Indent',
  'components.controls.list.outdent': 'Outdent',

  // Remove
  'components.controls.remove.remove': 'Fjerne',
}
