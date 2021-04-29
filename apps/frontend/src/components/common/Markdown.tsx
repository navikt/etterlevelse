import React from 'react'
import ReactMarkdown from 'react-markdown'
import {Paragraph1} from 'baseui/typography'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {useDebouncedState} from '../../util/hooks'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {ExternalLink} from './RouteLink'
import {markdownLink} from '../../util/config'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export const Markdown = ({
                           vertical,
                           escapeHtml = true,
                           shortenLinks,
                           noMargin,
                           source,
                           sources: sourcesOrig
                         }: {source?: string, sources?: string[], escapeHtml?: boolean, noMargin?: boolean, shortenLinks?: boolean, vertical?: boolean}) => {
  const renderers = {
    p: (parProps: any) => {
      const {children} = parProps
      return <Paragraph1 marginTop={noMargin ? 0 : undefined} marginBottom={noMargin ? 0 : undefined}>{children}</Paragraph1>
    },
    href: (linkProps: any) => {
      const {children, href, node} = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return <StatefulTooltip content={href}>
        <span>
        <ExternalLink href={href}>
          {content} <FontAwesomeIcon size='sm' icon={faExternalLinkAlt}/>
        </ExternalLink>
        </span>
      </StatefulTooltip>
    }
  }

  const sources: string[] = sourcesOrig || (source ? [source] : [''])
  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return <Block $style={{
    // Fix font color in lists etc
    color: theme.colors.contentPrimary,
    fontFamily: theme.typography.font400.fontFamily,
    fontWeight: theme.typography.font400.fontWeight
  }}>
    <ReactMarkdown children={sources.join(vertical ? '\n\n' : ', ')}
                   components={renderers}
                   remarkPlugins={[remarkGfm]}
                   rehypePlugins={htmlPlugins}
    />
  </Block>
}

type MarkdownEditorProps = {
  initialValue: string,
  setValue: (v: string) => void,
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>,
  height?: string
}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  // Reduce UI lag by only updating field at set interval
  const [val, setVal] = useDebouncedState(props.initialValue, 500, props.setValue)

  return <MdEditor
    style={{height: props.height || '500px'}}
    defaultValue={props.initialValue}
    renderHTML={txt => <Markdown source={txt} shortenLinks={props.shortenLinks}/>}
    onChange={data => setVal(data.text)}
    onImageUpload={props.onImageUpload}
  />
}

export const MarkdownInfo = () => (
  <Block>Feltet bruker <ExternalLink href={markdownLink}>Markdown</ExternalLink>, se her for mer
    informasjon om formatet
  </Block>
)
