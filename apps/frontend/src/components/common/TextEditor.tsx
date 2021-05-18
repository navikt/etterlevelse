import React from 'react'
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js'
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

  React.useEffect(() => {
    const rawData = markdownToDraft(props.initialValue)
    setVal(EditorState.createWithContent(convertFromRaw(rawData)))
  }, [props.initialValue])

  return (
    <Block backgroundColor={ettlevColors.white} $style={{ border: `1px solid ${ettlevColors.textAreaBorder}` }}>
      <Editor
        editorStyle={{ padding: '10px', height: props.height || '500px' }}
        toolbarStyle={{ backgroundColor: ettlevColors.grey50, borderBottom: `1px solid ${ettlevColors.textAreaBorder}` }}
        onEditorStateChange={data => setVal(data)}
        contentState={convertToRaw(val.getCurrentContent())}
        toolbar={{
          options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'history'],
          inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
          list: { options: ['unordered', 'ordered'] },
          link: { options: ['link'] },
          image: { uploadCallback: props.onImageUpload },
        }}
      />
    </Block>
  )
}

export default TextEditor