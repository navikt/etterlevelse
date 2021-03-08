import React from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import {Paragraph2} from 'baseui/typography'
import remarkGfm from 'remark-gfm'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {useDebouncedState} from '../../util/hooks'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import {Block} from 'baseui/block'
import {theme} from '../../util'

export const Markdown = (props: {source?: string, sources?: string[], escapeHtml?: boolean, noMargin?: boolean, shortenLinks?: boolean}) => {
  const renderers = {
    paragraph: (parProps: any) => {
      const {children} = parProps
      return <Paragraph2 marginTop={props.noMargin ? 0 : undefined} marginBottom={props.noMargin ? 0 : undefined}>{children}</Paragraph2>
    },
    link: (linkProps: any) => {
      const {children, href, node} = linkProps
      const content = props.shortenLinks && node.children[0]?.value.indexOf("http") === 0
        ? <span>Lenke <FontAwesomeIcon size='sm' icon={faExternalLinkAlt}/></span> : children
      return <StatefulTooltip content={href}>
        <a href={href} target='_blank' rel='noopener noreferrer'>{content}</a>
      </StatefulTooltip>
    }
  }

  const sources: string[] = props.sources || (props.source ? [props.source] : [''])
  return <Block $style={{
    // Fix font color in lists etc
    color: theme.colors.contentPrimary
  }}>
    <ReactMarkdown source={sources.join(', ')}
                   escapeHtml={props.escapeHtml}
                   renderers={renderers}
                   plugins={[remarkGfm]}
    />
  </Block>
}

type MarkdownEditorProps = {
  initialValue: string,
  setValue: (v: string) => void,
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  // Reduce UI lag by only updating field at set interval
  const [val, setVal] = useDebouncedState(props.initialValue, 300, props.setValue)

  return <MdEditor
    style={{height: '500px'}}
    defaultValue={val}
    renderHTML={txt => <Markdown source={txt} shortenLinks={props.shortenLinks}/>}
    onChange={data => setVal(data.text)}
    onImageUpload={props.onImageUpload}
  />
}
