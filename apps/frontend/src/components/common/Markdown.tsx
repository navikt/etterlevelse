import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import { ExternalLink } from './RouteLink'
import { markdownLink } from '../../util/config'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ettlevColors } from '../../util/theme'
import { BodyLong, BodyShort, Heading, Link, List } from '@navikt/ds-react'

export const Markdown = ({
  vertical,
  escapeHtml = true,
  shortenLinks,
  source,
  sources: sourcesOrig,
  p1,
  fontColor,
}: {
  source?: string
  sources?: string[]
  escapeHtml?: boolean
  shortenLinks?: boolean
  vertical?: boolean
  p1?: boolean
  fontColor?: string
}) => {
  const renderers = {
    p: (parProps: any) => {
      const { children } = parProps
      if (p1) {
        return <BodyLong className="break-words">{children}</BodyLong>
      }
      return <BodyLong className="break-words">{children}</BodyLong>
    },

    h1: (headerProps: any) => {
      const { children } = headerProps
      return (
        <Heading size="small" level="2">
          {children}
        </Heading>
      )
    },
    h2: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size="small" level="2">
          {children}
        </Heading>
      )
    },

    h3: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size="xsmall" level="3">
          {children}
        </Heading>
      )
    },
    h4: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size="xsmall" level="4">
          {children}
        </Heading>
      )
    },
    href: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return (
        <Link href={href} target="_blank" rel="noopener noreferrer">
          {content} (åpnes i ny fane)
        </Link>
      )
    },
    a: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content = shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children

      return (
        <Link href={href} target="_blank" rel="noopener noreferrer">
          {content} (åpnes i ny fane)
        </Link>
      )
    },
    code: (codeProps: any) => {
      const { node, inline, className, children, ...props } = codeProps
      return (
        <code className={className} {...props} style={{ whiteSpace: 'normal', color: fontColor ? fontColor : ettlevColors.green800 }}>
          {children}
        </code>
      )
    },
    li: (liProps: any) => {
      const { children } = liProps
      if (p1) {
        return (
          <List.Item>
            <BodyShort className="break-words">{children}</BodyShort>
          </List.Item>
        )
      } else {
        return <List.Item className="break-all">{children}</List.Item>
      }
    },
    ul: (ulProps: any) => {
      const { children } = ulProps
      return <List>{children}</List>
    },
    ol: (olProps: any) => {
      const { children } = olProps
      return <List as="ol">{children}</List>
    },
  }

  const sources: string[] = sourcesOrig || (source ? [source.replaceAll('\n\n', '\n\n &nbsp; \n\n').replaceAll('\n', '\n\n')] : [''])
  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return (
    <div>
      <ReactMarkdown children={sources.join(vertical ? '\n\n' : ', ')} components={renderers} remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins} />
    </div>
  )
}

type MarkdownEditorProps = {
  initialValue: string
  setValue: (v: string) => void
  shortenLinks?: boolean
  onImageUpload?: (file: File) => Promise<string>
  height?: string
}

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  return (
    <MdEditor
      style={{ height: props.height || '500px' }}
      defaultValue={props.initialValue}
      renderHTML={(txt) => <Markdown source={txt} shortenLinks={props.shortenLinks} />}
      onImageUpload={props.onImageUpload}
    />
  )
}

export const MarkdownInfo = () => (
  <div>
    Feltet bruker <ExternalLink href={markdownLink}>Markdown</ExternalLink>, se her for mer informasjon om formatet
  </div>
)
