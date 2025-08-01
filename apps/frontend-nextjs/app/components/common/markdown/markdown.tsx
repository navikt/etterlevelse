import { BodyLong, BodyShort, Heading, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import ReactMarkdown from 'react-markdown'
import 'react-markdown-editor-lite/lib/index.css'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { markdownLink } from '../../../util/footer/footerUtil'
import { ettlevColors } from '../../../util/theme/theme'
import { ExternalLink } from '../routeLink/routeLink'

type TProps = {
  source?: string
  sources?: string[]
  escapeHtml?: boolean
  shortenLinks?: boolean
  vertical?: boolean
  p1?: boolean
  fontColor?: string
}

export const Markdown: FunctionComponent<TProps> = ({
  vertical,
  escapeHtml = true,
  shortenLinks,
  source,
  sources: sourcesOrig,
  p1,
  fontColor,
}) => {
  const renderers = {
    p: (parProps: any) => {
      const { children } = parProps
      if (p1) {
        return <BodyLong className='break-words'>{children}</BodyLong>
      }
      return <BodyLong className='break-words'>{children}</BodyLong>
    },

    h1: (headerProps: any) => {
      const { children } = headerProps
      return (
        <Heading size='small' level='2'>
          {children}
        </Heading>
      )
    },
    h2: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size='small' level='2'>
          {children}
        </Heading>
      )
    },

    h3: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size='xsmall' level='3'>
          {children}
        </Heading>
      )
    },
    h4: (headerProps: any) => {
      const { children } = headerProps

      return (
        <Heading size='xsmall' level='4'>
          {children}
        </Heading>
      )
    },
    href: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content =
        shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children
      return (
        <Link className='break-all' href={href} target='_blank' rel='noopener noreferrer'>
          {content} (åpner i en ny fane)
        </Link>
      )
    },
    a: (linkProps: any) => {
      const { children, href, node } = linkProps
      const content =
        shortenLinks && node.children[0]?.value.indexOf('http') === 0 ? 'Lenke' : children

      return (
        <Link className='break-all' href={href} target='_blank' rel='noopener noreferrer'>
          {content} (åpner i en ny fane)
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
            <BodyShort className='break-words'>{children}</BodyShort>
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
      return <List as='ol'>{children}</List>
    },
  }

  let sources: string[]

  if (sourcesOrig) {
    sources = sourcesOrig
  } else if (source) {
    sources = [source.replaceAll('\n\n', '\n\n &nbsp; \n\n').replaceAll('\n', '\n\n')]
  } else {
    sources = ['']
  }

  const htmlPlugins = escapeHtml ? [] : [rehypeRaw]
  return (
    <div>
      <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]} rehypePlugins={htmlPlugins}>
        {sources.join(vertical ? '&nbsp;&nbsp;\n\n  ' : ', ')}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownInfo = () => (
  <BodyShort className='mt-4 text-[var(--a-text-subtle)]'>
    <ExternalLink href={markdownLink}>Slik kan du bruke Markdown i dette feltet</ExternalLink>
  </BodyShort>
)
