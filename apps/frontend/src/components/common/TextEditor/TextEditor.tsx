import { RawDraftContentState, convertToRaw } from 'draft-js'
import { FormikErrors } from 'formik'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import { Editor } from 'react-draft-wysiwyg'
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useDebouncedState } from '../../../util/hooks/customHooks'
import { ettlevColors } from '../../../util/theme'
import { FormError } from '../ModalSchema'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../Style'
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
  setIsFormDirty?: (v: boolean) => void
}

const TextEditor = (props: TTextEditorProps) => {
  const { initialValue, setValue, height, errors, name, simple, width, maxWidth, setIsFormDirty } =
    props

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
      },
      preserveNewlines: true,
    })
  }

  const CustomMarkdownToDraft = (data: string) =>
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

  const hasError = errors && name && errors[name]

  return (
    <div>
      <div
        style={{
          backgroundColor: ettlevColors.white,
          ...borderColor(hasError ? ettlevColors.red500 : ettlevColors.textAreaBorder),
          ...borderWidth(hasError ? '0.125rem' : '0.063rem'),
          ...borderStyle('solid'),
          ...borderRadius('0.25rem'),
          width: width || undefined,
          maxWidth: maxWidth || undefined,
        }}
      >
        <Editor
          editorStyle={{
            padding: '0.625rem',
            minHeight: height || '31.25rem',
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
          tabIndex={0}
          toolbar={{
            options: simple
              ? ['inline', 'list', 'link']
              : ['inline', 'blockType', 'list', 'link', 'history'],
            blockType: {},
            inline: { options: ['bold'] },
            // old toolbar
            // inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
            list: { options: ['unordered', 'ordered'] },
            link: {
              defaultTargetOption: '_blank',
              options: ['link'],
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

  // Inline
  'components.controls.inline.bold': 'Bold',
  'components.controls.inline.italic': 'Italic',
  'components.controls.inline.underline': 'Underline',
  'components.controls.inline.strikethrough': 'Strikethrough',
  'components.controls.inline.monospace': 'Monospace',

  // Link
  'components.controls.link.linkTitle': 'Link Tittel',
  'components.controls.link.linkTarget': 'Link Url',
  'components.controls.link.linkTargetOption': 'Åpen link i nytt vindu',
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
