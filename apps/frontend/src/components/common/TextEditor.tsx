import React from 'react'
import { convertToRaw, EditorState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { draftToMarkdown } from 'markdown-draft-js'
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Block } from 'baseui/block'
import { ettlevColors } from '../../util/theme'


const TextEditor = () => {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())


  return (
    <Block backgroundColor={ettlevColors.white}>
      <Editor
        toolbarClassName="rdw-storybook-toolbar"
        wrapperClassName="rdw-storybook-wrapper"
        editorClassName="rdw-storybook-editor"
        onEditorStateChange={(value: any) => {
          setEditorState(value)
        }}
      />
      <textarea
        disabled
        value={editorState && draftToMarkdown(convertToRaw(editorState.getCurrentContent()))}
      />
    </Block>
  )
}

export default TextEditor