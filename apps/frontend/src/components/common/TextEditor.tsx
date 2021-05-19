import React from 'react'
import { convertToRaw, RawDraftContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Block } from 'baseui/block'
import { ettlevColors } from '../../util/theme'
import { useDebouncedState } from '../../util/hooks'

type TextEditorProps = {
  initialValue: string,
  setValue: (v: string) => void,
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>,
  height?: string
}

const TextEditor = (props: TextEditorProps) => {
  const [val, setVal] = useDebouncedState(props.initialValue, 500, props.setValue)

  const CustomDraftToMarkdown = (data: RawDraftContentState) => {
    return draftToMarkdown( data, {
      styleItems:{
        code: {
          open: () => {
            return '```\n'
          },
          close: () => {
            return '\n```'
          },
        }
      }
    })
  }

  return (
    <Block backgroundColor={ettlevColors.white} $style={{ border: `1px solid ${ettlevColors.textAreaBorder}` }}>
      <Editor
        editorStyle={{ padding: '10px', height: props.height || '500px' }}
        toolbarStyle={{ backgroundColor: ettlevColors.grey50, borderBottom: `1px solid ${ettlevColors.textAreaBorder}` }}
        onEditorStateChange={data => {
          setVal(CustomDraftToMarkdown(convertToRaw(data.getCurrentContent())))
        }}
        initialContentState={markdownToDraft(val)}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'link', 'image', 'history'],
          inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
          list: { options: ['unordered', 'ordered'] },
          link: { options: ['link'] },
          //image: { uploadCallback: props.onImageUpload },
        }}
      />
      <textarea value={val}/>
    </Block>
  )
}

export default TextEditor