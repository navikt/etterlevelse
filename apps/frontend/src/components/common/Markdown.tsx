import { BodyLong, BodyShort, Heading, Link, List } from '@navikt/ds-react'
import ReactMarkdown from 'react-markdown'
import 'react-markdown-editor-lite/lib/index.css'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { markdownLink } from '../../util/config'
import { ettlevColors } from '../../util/theme'
import { ExternalLink } from './RouteLink'

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
      const content =
        shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return (
        <Link className="break-all" href={href} target="_blank" rel="noopener noreferrer">
          {content} (åpnes i ny fane)
        </Link>
      )
    },
    a: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content =
        shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children

      return (
        <Link className="break-all" href={href} target="_blank" rel="noopener noreferrer">
          {content} (åpnes i ny fane)
        </Link>
      )
    },
    code: (codeProps: any) => {
      const { className, children, ...props } = codeProps
      return (
        <code
          className={className}
          {...props}
          style={{ whiteSpace: 'normal', color: fontColor ? fontColor : ettlevColors.green800 }}
        >
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
        return <List.Item>{children}</List.Item>
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

  const sources: string[] =
    sourcesOrig ||
    (source ? [source.replaceAll('\n\n', '\n\n &nbsp; \n\n').replaceAll('\n', '\n\n')] : [''])
  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return (
    <div>
      <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins}>
        {sources.join(vertical ? '\n\n' : ', ')}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownInfo = () => (
  <div className="mt-4">
    Feltet bruker <ExternalLink href={markdownLink}>Markdown</ExternalLink>, se her for mer
    informasjon om formatet
  </div>
)
