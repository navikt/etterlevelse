import React from 'react'
import { convertToRaw, RawDraftContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import '../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './customStyle.css'
import { Block } from 'baseui/block'
import { ettlevColors } from '../../../util/theme'
import { useDebouncedState } from '../../../util/hooks'

type TextEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
  height?: string
}

const TextEditor = (props: TextEditorProps) => {
  const [val, setVal] = useDebouncedState(props.initialValue, 500, props.setValue)

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
    })
  }

  const CustomMarkdownToDraft = (data: string) => {
    return markdownToDraft(data, {
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
    })
  }

  return (
    <Block backgroundColor={ettlevColors.white} $style={{ border: `1px solid ${ettlevColors.textAreaBorder}` }}>
      <Editor
        editorStyle={{ padding: '10px', height: props.height || '500px' }}
        toolbarStyle={{ backgroundColor: ettlevColors.grey50, borderBottom: `1px solid ${ettlevColors.textAreaBorder}` }}
        onEditorStateChange={(data) => {
          setVal(CustomDraftToMarkdown(convertToRaw(data.getCurrentContent())))
        }}
        initialContentState={CustomMarkdownToDraft(val)}
        localization={{
          translations: translations,
        }}
        tabIndex={0}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'link', 'history'],
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
    </Block>
  )
}

export default TextEditor

const translations = {
  // Generic
  'generic.add': 'Legg Til',
  'generic.cancel': 'Avbryt',

  // BlockType
  'components.controls.blocktype.h1': 'H1',
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
