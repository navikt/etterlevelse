import React from 'react'
import { convertToRaw, EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { draftToMarkdown } from 'markdown-draft-js'
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Block } from 'baseui/block'
import { ettlevColors } from '../../util/theme'

type TextEditorProps = {
  initialValue: string,
  setValue: (v: string) => void,
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>,
  height?: string
}

const TextEditor = (props: TextEditorProps) => {
  const [val, setVal] = React.useState(EditorState.createEmpty())

  return (
    <Block backgroundColor={ettlevColors.white} $style={{border: `1px solid ${ettlevColors.textAreaBorder}`}}>
      <Editor
        editorStyle={{padding: '10px'}}
        toolbarStyle={{backgroundColor: ettlevColors.grey50, borderBottom: `1px solid ${ettlevColors.textAreaBorder}` }}
        onEditorStateChange={data => setVal(data)}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'history'],
          inline: {options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace']},
          list: {options: ['unordered', 'ordered']},
          link: { options: ['link']},
          image: {uploadCallback: props.onImageUpload},
        }}
      />
      <textarea
        disabled
        value={val && draftToMarkdown(convertToRaw(val.getCurrentContent()))}
      />
    </Block>
  )
}

export default TextEditor