import React, {useEffect} from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import {Paragraph2} from 'baseui/typography'
import remarkGfm from 'remark-gfm'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {useDebouncedState} from '../../util/hooks'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'

export const Markdown = (props: {source?: string, sources?: string[], escapeHtml?: boolean, noMargin?: boolean, shortenLinks?: boolean}) => {
  const renderers = {
    paragraph: (parProps: any) => {
      const {children} = parProps
      return <Paragraph2 marginTop={props.noMargin ? 0 : undefined} marginBottom={props.noMargin ? 0 : undefined}>{children}</Paragraph2>
    },
    link: (linkProps: any) => {
      const {children, href} = linkProps
      const content = props.shortenLinks ? <span>Lenke <FontAwesomeIcon size='sm' icon={faExternalLinkAlt}/></span> : children
      return <StatefulTooltip content={href}>
        <a href={href} target='_blank' rel='noopener noreferrer'>{content}</a>
      </StatefulTooltip>
    }
  }

  const sources: string[] = props.sources || (props.source ? [props.source] : [''])
  const usedSource = props.shortenLinks ? sources.map(shortenUrls) : sources
  return <ReactMarkdown source={usedSource.join(', ')}
                        escapeHtml={props.escapeHtml}
                        renderers={renderers}
                        plugins={[remarkGfm]}
  />
}

const shortenUrls = (source: string) =>
  source
  .split(' ')
  .map((word, i) => isLink(word) ? `[${i === 0 ? 'S' : 's'}e ekstern link](${word})` : word)
  .join(' ')

const urlRegex = /http[s]?:\/\/.*/
const isLink = (text: string) => urlRegex.test(text)


type MarkdownEditorProps = {
  initialValue: string,
  setValue: (v: string) => void,
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
}
export const MarkdownEditor = (props: MarkdownEditorProps) => {
  // Reduce UI lag by only updating field at set interval
  const [val, setVal] = useDebouncedState(props.initialValue, 300)
  useEffect(() => {
    props.setValue(val)
  }, [val])

  return <MdEditor
    style={{height: '400px'}}
    defaultValue={val}
    renderHTML={txt => <Markdown source={txt} shortenLinks={props.shortenLinks}/>}
    onChange={data => setVal(data.text)}
    onImageUpload={props.onImageUpload}
  />
}
